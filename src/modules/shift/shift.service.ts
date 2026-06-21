import { PrismaClient } from "../../../generated/prisma/client.js";
import { PaymentMethod } from "../../../generated/prisma/enums.js"; 
import { ApiError } from "../../utils/api-error.js";
import { OpenShiftDTO } from "./dto/shift.dto.js";
import { CloseShiftDTO } from "./dto/shift.dto.js";

export class ShiftService {
  constructor(private prisma: PrismaClient) {}

  openShift = async (cashierId: string, body: OpenShiftDTO) => {
    const activeShift = await this.prisma.shift.findFirst({
      where: {
        cashierId,
        endTime: null,
      },
    });

    if (activeShift) {
      throw new ApiError("You still have an active shift", 400);
    }

    const shift = await this.prisma.shift.create({
      data: {
        cashierId,
        initialCash: body.initialCash,
      },
    });

    return {
      message: "Shift opened",
      data: shift,
    };
  };

  getActiveShift = async (cashierId: string) => {
    const shift = await this.prisma.shift.findFirst({
      where: {
        cashierId: cashierId,
        endTime: null,
      },
    });

    if (!shift) {
      throw new ApiError("No active shift found", 404);
    }

    return shift;
  };

  closeShift = async (shiftId: string, body: CloseShiftDTO) => {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { transactions: true },
    });

    if (!shift) {
      throw new ApiError("Shift not found", 404);
    }

    if (shift.endTime) {
      throw new ApiError("Shift already closed", 400);
    }

    let totalCash = 0;
    let totalDebit = 0;
    let totalSales = 0;

    for (const t of shift.transactions) {
      const amount = Number(t.totalAmount);
      totalSales += amount;
      
      if (t.paymentMethod === PaymentMethod.CASH) {
        totalCash += amount;
      } else if (t.paymentMethod === PaymentMethod.DEBIT) {
        totalDebit += amount;
      }
    }

    const initialCash = Number(shift.initialCash);
    const finalCash = body.finalCash;
    const expectedFinalCash = initialCash + totalCash;
    const discrepancy = finalCash - expectedFinalCash;
    const totalTransactions = shift.transactions.length;

    const [updatedShift, shiftSummary] = await this.prisma.$transaction([
      this.prisma.shift.update({
        where: { id: shiftId },
        data: {
          endTime: new Date(),
          finalCash: finalCash,
        },
      }),
      this.prisma.shiftSummary.create({
        data: {
          shiftId: shiftId,
          totalTransactions,
          totalSales,
          totalCash,
          totalDebit,
          discrepancy,
        },
      }),
    ]);

    return {
      message: "Shift closed and summary generated successfully",
      data: {
        shift: updatedShift,
        summary: shiftSummary,
      },
    };
  };

  findAll = async () => {
    return this.prisma.shift.findMany({
      include: {
        cashier: true,
        shiftSummaries: true, 
      },
      orderBy: {
        startTime: "desc",
      },
    });
  };

  findById = async (id: string) => {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        cashier: true,
        transactions: true,
        shiftSummaries: true,
      },
    });

    if (!shift) {
      throw new ApiError("Shift not found", 404);
    }

    return shift;
  };
}