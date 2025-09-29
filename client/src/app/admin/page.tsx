import HeaderBox from '@/components/HeaderBox'

const Home = ()=> {
 
  return (
    <section className="home">
      <div className="home-content">
        <HeaderBox type='greeting' title={'welcome '} subtext={'admin'}/>
      </div>

    </section>
  )
}

export default Home;