import HeaderBox from '@/components/common/HeaderBox'
import { InvestmentCyclesPage } from '@/components/user/cycles/cycles-page'
import React from 'react'

function page() {
  return (
    <div> 
      <HeaderBox title='cycle page' subtext='this is cycle page view '/>
      <InvestmentCyclesPage/>
    </div>
  )
}

export default page