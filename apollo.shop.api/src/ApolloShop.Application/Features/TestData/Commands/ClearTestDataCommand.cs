using MediatR;

namespace ApolloShop.Application.Features.TestData.Commands;

public record ClearTestDataCommand : IRequest<TestDataClearResult>;

public sealed class ClearTestDataCommandHandler : IRequestHandler<ClearTestDataCommand, TestDataClearResult>
{
    private readonly Abstractions.IApplicationDbContext _db;

    public ClearTestDataCommandHandler(Abstractions.IApplicationDbContext db) => _db = db;

    public Task<TestDataClearResult> Handle(ClearTestDataCommand request, CancellationToken cancellationToken) =>
        TestDataCleanup.ClearAsync(_db, cancellationToken);
}
