import { PrismaClient } from "../../../generated/prisma/client.js";
import { StockMovementType } from "../../../generated/prisma/enums.js";
import { CreateStockMovementDTO } from "./dto/inventory.dto.js";
import { ApiError } from "../../utils/api-error.js";

export class InventoryService {
  constructor(private prisma: PrismaClient) {}

  create = async (body: CreateStockMovementDTO, userId: string) => {
    // 1. Cek ketersediaan produk
    const product = await this.prisma.product.findUnique({
      where: { id: body.productId },
    });

    if (!product || product.isDeleted) {
      throw new ApiError("Product not found", 404);
    }

    // 2. Kalkulasi stok baru berdasarkan tipe pergerakan
    let newStock = product.stock;
    const absQty = Math.abs(body.qty); // Memastikan angka absolut untuk mempermudah logika

    if (body.type === StockMovementType.IN) {
      newStock += absQty;
    } else if (body.type === StockMovementType.OUT) {
      newStock -= absQty;
    } else if (body.type === StockMovementType.ADJUSTMENT) {
      // Adjustment bisa menambah atau mengurangi tergantung input positif/negatif
      newStock += body.qty;
    }

    // 3. Validasi agar stok tidak menjadi minus
    if (newStock < 0) {
      throw new ApiError(`Insufficient stock. Current stock is ${product.stock}`, 400);
    }

    // 4. Eksekusi Database Transaction (Harus berhasil keduanya atau gagal keduanya)
    const [updatedProduct, movement] = await this.prisma.$transaction([
      // Update stok di tabel Product
      this.prisma.product.update({
        where: { id: body.productId },
        data: { stock: newStock },
      }),
      // Buat riwayat pergerakan stok
      this.prisma.stockMovement.create({
        data: {
          productId: body.productId,
          qty: body.qty,
          type: body.type,
          notes: body.notes,
          createdById: userId, // Diambil dari token JWT kasir/admin yang login
        },
      }),
    ]);

    return {
      message: "Stock movement recorded successfully",
      data: {
        movementId: movement.id,
        productName: updatedProduct.name,
        previousStock: product.stock,
        currentStock: updatedProduct.stock,
        movementType: movement.type,
      },
    };
  };

  findAll = async (productId?: string) => {
    const movements = await this.prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: {
          select: { name: true, stock: true },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      message: "Success fetch stock movements",
      data: movements,
    };
  };
}