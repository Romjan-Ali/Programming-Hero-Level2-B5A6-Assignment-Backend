import { Query } from 'mongoose'
import { excludeField } from '../constant'

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>
  public readonly query: Record<string, string>

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery
    this.query = query
  }

  filter(): this {
    const filter = { ...this.query }

    for (const field of excludeField) {
      delete filter[field]
    }

    this.modelQuery = this.modelQuery.find(filter) // Tour.find().find(filter)

    return this
  }

  /**
   * Create date filter query
   * Query should have two parameter, startDate and endDate
   * Filter based on createdAt field from the document
   * Example of createdAt value is 2025-08-24T06:40:03.569Z
   */

/*   dateFilter(): this {
    const { startDate, endDate } = this.query

    if (startDate || endDate) {
      const dateQuery: any = {}

      if (startDate) {
        // Convert to Date object if it's a valid date string
        const start = new Date(startDate)
        if (!isNaN(start.getTime())) {
          dateQuery['$gte'] = start // greater than or equal to startDate
        }
      }

      if (endDate) {
        const end = new Date(endDate)
        if (!isNaN(end.getTime())) {
          dateQuery['$lte'] = end // less than or equal to endDate
        }
      }

      console.log({dateQuery})

      if (Object.keys(dateQuery).length > 0) {
        this.modelQuery = this.modelQuery.find({
          createdAt: dateQuery, // Apply the date filter on the createdAt field
        })
      }
    }

    return this
  } */

  search(searchableField: string[]): this {
    const searchTerm = this.query.searchTerm || ''
    const searchQuery = {
      $or: searchableField.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    }
    this.modelQuery = this.modelQuery.find(searchQuery)
    return this
  }

  sort(): this {
    const sort = this.query.sort || '-createdAt'

    this.modelQuery = this.modelQuery.sort(sort)

    return this
  }
  
  fields(): this {
    const fields = this.query.fields?.split(',').join(' ') || ''

    this.modelQuery = this.modelQuery.select(fields)

    return this
  }

  paginate(): this {
    const page = Number(this.query.page) || 1
    const limit = Number(this.query.limit) || 10
    const skip = (page - 1) * limit

    this.modelQuery = this.modelQuery.skip(skip).limit(limit)

    return this
  }

  build() {
    return this.modelQuery
  }

  async getMeta() {
    const queryWithoutPagination = { ...this.query }
    delete queryWithoutPagination.page
    delete queryWithoutPagination.limit
    // delete queryWithoutPagination.startDate
    // delete queryWithoutPagination.endDate

    // Count the documents based on the query without pagination
    const totalDocuments = await this.modelQuery.model.countDocuments(
      queryWithoutPagination
    )

    const page = Number(this.query.page) || 1
    const limit = Number(this.query.limit) || 10

    const totalPage = Math.ceil(totalDocuments / limit)

    return { page, limit, total: totalDocuments, totalPage }
  }
}
