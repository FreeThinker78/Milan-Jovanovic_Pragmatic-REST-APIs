using DevHabit.Api.DTOs.Habits;
using Microsoft.EntityFrameworkCore;

namespace DevHabit.Api.DTOs.Common;

public sealed record PaginationResult<T> : ICollectionResponse<T>
{
    public List<T> Items { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasProviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public static async Task<PaginationResult<T>> CreateAsync(
        IQueryable<T> query,
        int page,
        int pageSize)
    {
        int totalCount = await query.CountAsync();

        List<T> items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginationResult<T>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }
}
