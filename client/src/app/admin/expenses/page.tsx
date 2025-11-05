import HeaderBox from '@/components/common/HeaderBox'
import ResponsiveTable from '@/components/common/ResponsiveTable'
import React from 'react'

function page() {
  return (
    <>
    <HeaderBox title='expenses management' 
    subtext='manage organizational expenses'/>
    <ResponsiveTable />
    </>
  )
}

export default page