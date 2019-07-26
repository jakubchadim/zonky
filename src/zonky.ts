
type Loan = {
  amount: number
}

type PageInfo = {
  currentPage: number
  totalPages: number
}

type LoansResponse = [Loan[], PageInfo]

const API_URL: string = 'https://api.zonky.cz/loans/marketplace'
const PAGE_ENTRIES: number = 10000

export async function fetchAvgLoans (rating: string, signal?: AbortSignal): Promise<number> {
  const [firstLoans, pageInfo] = await fetchLoans(rating, 0, signal)

  if (pageInfo.totalPages === 0) {
    return 0
  }

  const otherLoans: LoansResponse[] = await Promise.all(
    Array.from(Array(pageInfo.totalPages - 1).keys())
      .map((idx) => fetchLoans(rating, idx + 1, signal))
  )

  const allLoans: Loan[] = [
    firstLoans,
    ...otherLoans.map(([loans]) => loans)

  ].flat(1)

  return allLoans.reduce((memo, loan) => memo + loan.amount, 0) / allLoans.length
}

async function fetchLoans (rating: string, page: number = 0, signal?: AbortSignal): Promise<LoansResponse> {
  const response = await fetch(`${API_URL}?rating__eq=${rating}&fields=amount`, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Zonky/0.1.0 (https://github.com/jakubchadim/zonky)',
      'X-Page': page.toString(),
      'X-Size': PAGE_ENTRIES.toString()
    },
    signal
  })

  if (!response.ok) {
    throw new Error('Fetch failed')
  }

  const totalPages: number = Math.ceil(<number>(response.headers.get('X-Total') || 0) / PAGE_ENTRIES)

  return [
    await response.json() as Loan[],
    {
      currentPage: page,
      totalPages
    }
  ]
}
