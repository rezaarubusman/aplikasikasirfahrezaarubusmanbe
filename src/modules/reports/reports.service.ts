import { PrismaClient } from "../../../generated/prisma/client.js";
import { PaymentMethod } from "../../../generated/prisma/enums.js";

export class ReportService {
  constructor(private prisma: PrismaClient) {}

  private getDateRange(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate 
      ? new Date(startDate) 
      : new Date(new Date().setDate(end.getDate() - 30));

    return { start, end };
  }

  getSalesSummary = async (startDate?: string, endDate?: string) => {
    const { start, end } = this.getDateRange(startDate, endDate);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const dailySummary: Record<string, { date: string; totalRevenue: number; totalTransactions: number }> = {};
    
    let grandTotalRevenue = 0;
    let cashTotal = 0;
    let debitTotal = 0;

    transactions.forEach((t) => {
      const dateKey = t.createdAt.toISOString().split("T")[0]; 
      const amount = Number(t.totalAmount);

      if (!dailySummary[dateKey]) {
        dailySummary[dateKey] = { date: dateKey, totalRevenue: 0, totalTransactions: 0 };
      }

      dailySummary[dateKey].totalRevenue += amount;
      dailySummary[dateKey].totalTransactions += 1;

      grandTotalRevenue += amount;
      if (t.paymentMethod === PaymentMethod.CASH) cashTotal += amount;
      if (t.paymentMethod === PaymentMethod.DEBIT) debitTotal += amount;
    });

    return {
      message: "Success fetch sales summary",
      data: {
        period: { start, end },
        grandTotalRevenue,
        totalTransactions: transactions.length,
        paymentBreakdown: [
          { method: "CASH", totalAmount: cashTotal },
          { method: "DEBIT", totalAmount: debitTotal },
        ],
        dailyReports: Object.values(dailySummary), 
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
      take: limit || 10, 
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
        totalRevenue: item._sum.subtotal ? Number(item._sum.subtotal) : 0,
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
      where: {
        endTime: { not: null }, 
        startTime: { gte: start, lte: end },
        ...(cashierId && { cashierId })
      },
      include: {
        cashier: { select: { name: true } },
        shiftSummaries: true 
      },
      orderBy: { startTime: "desc" }
    });

    const report = shifts.map((shift) => {
      const summary = shift.shiftSummaries[0];
      const initialCash = Number(shift.initialCash);
      const finalCash = Number(shift.finalCash || 0);

      const totalCashSales = summary ? Number(summary.totalCash) : 0;
      const totalDebitSales = summary ? Number(summary.totalDebit) : 0;
      const totalTransactions = summary ? summary.totalTransactions : 0;
      
      const expectedCash = initialCash + totalCashSales;
      const discrepancy = summary ? Number(summary.discrepancy) : (finalCash - expectedCash);

      return {
        shiftId: shift.id,
        cashierName: shift.cashier.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        initialCash,
        finalCash,
        totalCashSales,
        totalDebitSales,
        totalTransactions,
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