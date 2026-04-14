
// /**
//  * Build a pagination meta block from Prisma-style count results.
//  *
//  * @param {{ total: number, page: number, limit: number }} params
//  * @returns {object}
//  */
// export const paginationMeta = ({ total, page, limit }) => ({
//   total,
//   page,
//   limit,
//   totalPages: Math.ceil(total / limit),
//   hasNextPage: page * limit < total,
//   hasPrevPage: page > 1,
// });