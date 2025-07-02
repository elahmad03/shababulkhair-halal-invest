import AnimatedCounter from './AnimatedCounter';

const TotalBalanceBox = ({
  totalCurrentBalance=1234.56
}: TotalBalanceBoxProps) => {
  return (
    <section className="total-balance">
      
        <div className="flex flex-col gap-2">
          <p className="total-balance-label">
            Total Current Balance
          </p>

          <div className="total-balance-amount flex-center gap-2">
            <AnimatedCounter amount={totalCurrentBalance} />
          </div>
          </div>
        
    </section>
  )
}

export default TotalBalanceBox