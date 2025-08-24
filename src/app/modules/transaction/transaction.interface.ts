export enum TransactionType {
  top_up = 'top_up',
  withdraw = 'withdraw',
  cash_in = 'cash_in',
  cash_out = 'cash_out',
  send_money = 'send_money',
  payment = 'payment',
  add_money = 'add_money',
  refund = 'refund',
}

export enum TransactionStatus {
  pending = 'pending',
  completed = 'completed',
  reversed = 'reversed',
}

export interface ITransaction {
  _id?: string
  amount: number
  type: TransactionType
  from: string // Wallet ID or User ID
  to: string // Wallet ID or User ID (if applicable)
  reference?: string
  status: TransactionStatus
  createdAt?: Date
  updatedAt?: Date
}
