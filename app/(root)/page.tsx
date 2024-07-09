import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import HeaderBox from '@/components/ui/HeaderBox'
import React from 'react'

const Home = () => {

    const loggedIn = {firstName:"Rashi", lastName:"Kulshreshtha",email:"rashikulshreshtha23@gmail.com"};

  return (
    <section className='home'>
      <div className='home-content'>
        <header className="home-header">
            <HeaderBox 
                type="greeting"
                title="Welcome"
                user={loggedIn?.firstName || "Guest"}  
                subtext="Access and manage your account and transactions efficiently "
            />

            <TotalBalanceBox
                accounts={[]}
                totalBanks={1}
                totalCurrentBalance={100}    
            />
        </header>

        RECENT TRANSACTIONS
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={[]}
        banks={[{currentBalance:25000},{currentBalance:10000}]}
      />
    </section>
  )
}

export default Home
