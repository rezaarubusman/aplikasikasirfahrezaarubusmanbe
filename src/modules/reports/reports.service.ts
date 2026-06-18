import { PrismaClient } from "../../../generated/prisma/client.js";
import { PaymentMethod } from "../../../generated/prisma/enums.js";

export class ReportService {
  constructor(private prisma: PrismaClient) {}

  private getDateRange(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate 
      ? new Date(startDate) 
      : new Date(new Date().setDate(end.getDate() - 30)); // Default: 30 hari ke belakang

    return { start, end };
  }

  getSalesSummary = async (startDate?: string, endDate?: string) => {
    const { start, end } = this.getDateRange(startDate, endDate);

    const salesData = await this.prisma.transaction.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const paymentBreakdown = await this.prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where: {
        createdAt: { gte: start, lte: end },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    return {
      message: "Success fetch sales summary",
      data: {
        period: { start, end },
        totalRevenue: salesData._sum.totalAmount || 0,
        totalTransactions: salesData._count.id,
        paymentBreakdown: paymentBreakdown.map((item) => ({
          method: item.paymentMethod,
          totalAmount: item._sum.totalAmount || 0,
          count: item._count.id,
        })),
      },
    };
  };

  getTopProducts = async (startDate?: string, endDate?: string, limit?: number) => {
    const { start, end } = this.getDateRange(startDate, endDate);

    const topItems = await this.prisma.transactionItem.groupBy({
      by: ["productId"],
      where: {
        createdAt: { gte: start, lte: end },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take:10, //Ambil 10 Product terlaris
      ...(limit && { take: limit }),
    });

    const productIds = topItems.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: { select: { name: true } } },
    });

    const result = topItems.map((item) => {
      const productInfo = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: productInfo?.name || "Unknown Product",
        category: productInfo?.category?.name || "Uncategorized",
        totalQuantitySold: item._sum.quantity || 0,
        totalRevenue: item._sum.subtotal || 0,
      };
    });

    return {
      message: "Success fetch top selling products",
      data: {
        period: { start, end },
        products: result,
      },
    };
  };

  getShiftDiscrepancies = async (startDate?: string, endDate?: string, cashierId?: string) => {
    const { start, end } = this.getDateRange(startDate, endDate);

    const shifts = await this.prisma.shift.findMany({
      where:{
        endTime: {not: null},
        startTime: {gte: start, lte: end},
        ...(cashierId && {cashierId})
      },
      include: {
        cashier: { select: { name: true } },
        transactions: {
          select: { totalAmount: true, paymentMethod: true }
        }
      },
      orderBy: { startTime:"desc" }
    });

    const report = shifts.map(shift => {
      const totalCashTransactions = shift.transactions
      .filter(t => t.paymentMethod === PaymentMethod.CASH)
      .reduce((sum, t) => sum + Number(t.totalAmount), 0
      );

      const totalDebitTransactions = shift.transactions
      .filter(t => t.paymentMethod === PaymentMethod.DEBIT)
      .reduce((sum, t) => sum + Number(t.totalAmount), 0
      );
      
      const expectedCash = Number(shift.initialCash) + totalCashTransactions;
      const actualCash = Number(shift.finalCash || 0);
      const discrepancy = actualCash - expectedCash;

      return {
        shiftId: shift.id,
        cashierName: shift.cashier.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        initialCash: shift.initialCash,
        finalCash: actualCash,
        totalCashSales: totalCashTransactions,
        totalDebitSales: totalDebitTransactions,
        totalTransactions: shift.transactions.length,
        expectedFinalCash: expectedCash,
        discrepancy,
        isMatch: discrepancy === 0
      };
    });

    return {
      message: "Success fetch shift discrepancies",
      data: {
        period: { start, end },
        report
      }
    };
  };
}