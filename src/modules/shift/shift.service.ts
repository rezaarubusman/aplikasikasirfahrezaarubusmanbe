import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { OpenShiftDTO } from "./dto/shift.dto.js";
import { CloseShiftDTO } from "./dto/shift.dto.js";

export class ShiftService {
  constructor(
    private prisma: PrismaClient
  ) {}

  openShift = async (
    cashierId: string,
    body: OpenShiftDTO
  ) => {

    const activeShift =
      await this.prisma.shift.findFirst({
        where: {
          cashierId,
          endTime: null,
        },
      });

    if (activeShift) {
      throw new ApiError(
        "You still have an active shift",
        400
      );
    }

    const shift =
      await this.prisma.shift.create({
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

  getActiveShift = async (
    cashierId: string
  ) => {

    const shift =
      await this.prisma.shift.findFirst({
        where: {
          cashierId: cashierId,
          endTime: null,
        },
      });

    if (!shift) {
      throw new ApiError(
        "No active shift found",
        404
      );
    }

    return shift;
  };

  closeShift = async (
    shiftId: string,
    body: CloseShiftDTO
  ) => {

    const shift =
      await this.prisma.shift.findUnique({
        where: {
          id: shiftId,
        },
      });

    if (!shift) {
      throw new ApiError(
        "Shift not found",
        404
      );
    }

    if (shift.endTime) {
      throw new ApiError(
        "Shift already closed",
        400
      );
    }

    const updatedShift =
      await this.prisma.shift.update({
        where: {
          id: shiftId,
        },
        data: {
          endTime: new Date(),
          finalCash: body.finalCash,
        },
      });

    return {
      message: "Shift closed",
      data: updatedShift,
    };
  };

  findAll = async () => {
    return this.prisma.shift.findMany({
      include: {
        cashier: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });
  };

  findById = async (
    id: string
  ) => {

    const shift =
      await this.prisma.shift.findUnique({
        where: {
          id,
        },
        include: {
          cashier: true,
          transactions: true,
          shiftSummaries: true,
        },
      });

    if (!shift) {
      throw new ApiError(
        "Shift not found",
        404
      );
    }

    return shift;
  };
}