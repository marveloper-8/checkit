import { Injectable, PipeTransform } from "@nestjs/common";
import { PaginationParams } from "../interfaces/pagination.interface";

@Injectable()
export class PaginationPipe implements PipeTransform {
    transform(value: any): PaginationParams {
        const page = parseInt(value.page, 10) || 1
        const limit = parseInt(value.limit, 10) || 10

        return {
            page: page > 0 ? page : 1,
            limit: limit > 0 && limit <= 100 ? limit : 10
        }
    }
}