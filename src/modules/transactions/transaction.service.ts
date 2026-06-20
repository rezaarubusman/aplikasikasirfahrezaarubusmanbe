import { PrismaClient } from "../../../generated/prisma/client.js";
import {
  PaymentMethod,
  Role,
  StockMovementType,
} from "../../../generated/prisma/enums.js";
import { AuthUser } from "../../types/auth-user.type.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateTransactionDTO } from "./dto/transaction.dto.js";

export class TransactionService {
  constructor(
    private prisma: PrismaClient
  ) {}

  create = async (cashierId: string, body: CreateTransactionDTO) => {
    const activeShift = await this.prisma.shift.findFirst({
      where: {
        cashierId,
        endTime: null,
      },
    });

    if (!activeShift) {
      throw new ApiError("No active shift found", 404);
    }

    const mergedItems = this.mergeItems(body.items);

    const productIds = mergedItems.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isDeleted: false,
      },
    });

    if (products.length !== productIds.length) {
      throw new ApiError("Some products were not found", 404);
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    const transactionItems = mergedItems.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new ApiError("Product not found", 404);
      }

      const price = Number(product.price);

      return {
        productId: product.id,
        quantity: item.quantity,
        priceAtTransaction: price,
        subtotal: price * item.quantity,
      };
    });

    const totalAmount = transactionItems.reduce((total, item) => total + item.subtotal, 0);

    this.validatePayment(body, totalAmount);

    const changeAmount =
      body.paymentMethod === PaymentMethod.CASH
        ? (body.cashTendered ?? 0) - totalAmount
        : undefined;

    const invoiceNumber = await this.generateInvoiceNumber();

    const transaction = await this.prisma.$transaction(async (tx) => {
      // Anti race condition stock check
      for (const item of transactionItems) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            isDeleted: false,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (result.count === 0) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          throw new ApiError(`Insufficient stock for ${product?.name ?? "product"}`, 400);
        }

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            qty: item.quantity,
            type: StockMovementType.OUT,
            notes: `Transaction ${invoiceNumber}`,
            createdById: cashierId,
          },
        });
      }

      const createdTransaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          shiftId: activeShift.id,
          totalAmount,
          paymentMethod: body.paymentMethod,
          cashTendered:
            body.paymentMethod === PaymentMethod.CASH
              ? body.cashTendered
              : undefined,
          changeAmount,
          debitCardNumber:
            body.paymentMethod === PaymentMethod.DEBIT
              ? body.debitCardNumber
              : undefined,
          transactionItems: {
            create: transactionItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTransaction: item.priceAtTransaction,
              subtotal: item.subtotal,
            })),
          },
        },
        include: this.transactionInclude,
      });

      return createdTransaction;
    });

    return {
      message: "Transaction created",
      data: transaction,
    };
  };

  findAll = async (shiftId: string | undefined, user: AuthUser) => {
    const shiftFilter =
      user.role === Role.ADMIN
        ? { shiftId }
        : {
            shiftId,
            shift: {
              cashierId: user.id,
            },
          };

    return this.prisma.transaction.findMany({
      where: shiftFilter,
      include: this.transactionInclude,
      orderBy: {
        createdAt: "desc",
      },
    });
  };

  findById = async (id: string, user: AuthUser) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id,
      },
      include: this.transactionInclude,
    });

    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }

    if (
      user.role !== Role.ADMIN &&
      transaction.shift.cashierId !== user.id
    ) {
      throw new ApiError(
        "You don't have access to this resource", 403
      );
    }

    return transaction;
  };

  private mergeItems = (items: CreateTransactionDTO["items"]) => {
    const itemMap = new Map<string, number>();

    for (const item of items) {
      itemMap.set(item.productId, (itemMap.get(item.productId) ?? 0) + item.quantity);
    }

    return Array.from(itemMap, ([productId, quantity]) => ({ productId, quantity }));
  };

  private validatePayment = (
    body: CreateTransactionDTO,
    totalAmount: number
  ) => {
    if (
      body.paymentMethod === PaymentMethod.CASH && (body.cashTendered ?? 0) < totalAmount
    ) {
      throw new ApiError("Cash tendered is less than total amount", 400);
    }

    if (body.paymentMethod === PaymentMethod.DEBIT && !body.debitCardNumber) {
      throw new ApiError("Debit card number is required", 400);
    }
  };

  private generateInvoiceNumber = async () => {
    const date = new Date();
    const datePart = date
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
    const prefix =
      `INV-${datePart}`;

    const latestTransaction =
      await this.prisma.transaction.findFirst({where: {
          invoiceNumber: {
            startsWith: prefix,
          },
        },
        orderBy: {
          invoiceNumber: "desc",
        },
      });

    const latestSequence =
      latestTransaction ? Number(latestTransaction.invoiceNumber.split("-").at(-1)) : 0;

    return `${prefix}-${String(latestSequence + 1).padStart(4, "0")}`;
  };

  private transactionInclude = {
    shift: {
      include: {
        cashier: true,
      },
    },
    transactionItems: {
      include: {
        product: true,
      },
    },
  } as const;
}
