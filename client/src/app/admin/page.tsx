import HeaderBox from '@/components/common/HeaderBox'

const Page = ()=> {
 
  return (
    <section className="m-4 ">
      <div className="p-6">
        <HeaderBox type='greeting' title={'welcome '} subtext={'admin'}/>
      </div>

    </section>
  )
}

export default Page;