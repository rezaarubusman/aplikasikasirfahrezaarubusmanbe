import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { ReportService } from "./reports.service.js";
import { DateRangeDTO } from "./dto/reports.dto.js";

export class ReportController {
  constructor(private service: ReportService) {}

  getSalesSummary = async (req: Request, res: Response) => {
    // Karena data datang dari query string, kita mapping dari req.query
    const query = plainToInstance(DateRangeDTO, req.query);

    const result = await this.service.getSalesSummary(
      query.startDate,
      query.endDate
    );

    res.status(200).send(result);
  };

  getTopProducts = async (req: Request, res: Response) => {
    const query = plainToInstance(DateRangeDTO, req.query);

    const result = await this.service.getTopProducts(
      query.startDate,
      query.endDate,
      query.limit
    );

    res.status(200).send(result);
  };

  getShiftDiscrepancies = async (req: Request, res: Response) => {
    const query = plainToInstance(DateRangeDTO, req.query);

    const result = await this.service.getShiftDiscrepancies(
      query.startDate,
      query.endDate,
      query.cashierId
    );

    res.status(200).send(result);
  };
}