import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, AreaChart, BarChart, DonutChart } from '@tremor/react';
import { Activity, TrendingUp, Users } from 'lucide-react';
import AnimatedLineChart from './AnimatedLineChart';
import { getBalance } from '../../sui/queries';
import StatCard from './StatCard';

interface ExpenseData {
  date: string;
  expenses: number;
  income: number;
}

interface ParticipantDebt {
  name: string;
  amount: number;
}

const monthlyData: ExpenseData[] = [
  { date: 'Jan', expenses: 250, income: 400 },
  { date: 'Feb', expenses: 300, income: 150 },
  { date: 'Mar', expenses: 200, income: 950 },
  { date: 'Apr', expenses: 278, income: 400 },
  { date: 'May', expenses: 189, income: 475 },
  { date: 'Jun', expenses: 239, income: 380 },
  { date: 'Jul', expenses: 349, income: 430 },
];

const participantDebts: ParticipantDebt[] = [
  { name: 'Alice', amount: 49.99 },
  { name: 'Bob', amount: 25.50 },
  { name: 'Charlie', amount: 15.75 },
];

const coinIllustration = (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="40" rx="16" ry="4" fill="#00D2D3" fillOpacity="0.18" />
    <circle cx="24" cy="24" r="14" fill="#00D2D3" />
    <circle cx="24" cy="24" r="10" fill="#fff" fillOpacity="0.9" />
    <text x="24" y="29" textAnchor="middle" fontSize="16" fill="#00D2D3" fontWeight="bold">$</text>
  </svg>
);

const Dashboard: React.FC = () => {
  const totalOwed = participantDebts.reduce((sum, debt) => sum + debt.amount, 0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

  // Sui balance
  const [suiBalance, setSuiBalance] = useState<string | null>(null);
  useEffect(() => {
    getBalance('0x9cfb...M0CK')
      .then((res) => setSuiBalance(res.totalBalance ? res.totalBalance : '0'))
      .catch(() => setSuiBalance('Error'));
  }, []);

  // Backend test & fetch state
  const [lookupId, setLookupId] = useState('');
  const [objectInfo, setObjectInfo] = useState<any>(null);
  const [lookupError, setLookupError] = useState('');

  const fetchObjectData = async () => {
    setLookupError('');
    setObjectInfo(null);
    try {
      const res = await fetch(`http://localhost:5000/api/object/${lookupId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setObjectInfo(data);
    } catch (err) {
      setLookupError((err as Error).message);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-8"
    >
      {/* Sui Balance Card */}
      <Card className="mb-4 bg-gradient-to-r from-cyan-700/40 to-cyan-900/40 border-cyan-500/30 shadow-lg">
        <div className="flex items-center gap-4">
          <img src="https://cryptologos.cc/logos/sui-sui-logo.png" alt="Sui" className="h-8 w-8" />
          <div>
            <div className="text-lg font-bold text-cyan-300">Sui Balance (0x9cfb...M0CK)</div>
            <div className="text-2xl font-mono text-white">{suiBalance === null ? 'Loading...' : suiBalance}</div>
          </div>
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Total Balance"
          value={totalOwed}
          prefix="$"
          icon={<TrendingUp className="h-7 w-7 text-white" />}
          gradientFrom="from-[#00D2D3]"
          gradientTo="to-[#192a56]"
          sparklineData={[50, 60, 55, 70, 68, 91, 92]}
          illustration={coinIllustration}
        />
        <StatCard
          title="Monthly Transactions"
          value={349}
          suffix=" txns"
          icon={<Activity className="h-7 w-7 text-white" />}
          gradientFrom="from-[#6C5CE7]"
          gradientTo="to-[#341f97]"
          percentChange={+2.3}
          percentColor="text-emerald-400"
          sparklineData={[40, 60, 80, 120, 100, 140, 130]}
        />
        <StatCard
          title="Active Participants"
          value={participantDebts.length}
          icon={<Users className="h-7 w-7 text-white" />}
          gradientFrom="from-[#00B894]"
          gradientTo="to-[#222f3e]"
          avatars={["A", "B", "C"]}
        />
      </div>

      {/* Charts */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={cardVariants}>
          <Card className="shadow-lg border border-gray-700/50">
            <Title>Monthly Expense Trends</Title>
            <div className="h-72 mt-6">
              <AnimatedLineChart
                data={monthlyData.map(d => ({ x: d.date, y: d.expenses }))}
                color="#6C5CE7"
                gradientFrom="#6C5CE7"
                gradientTo="#00D2D3"
                width={400}
                height={220}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="shadow-lg border border-gray-700/50">
            <Title>Recent Expenses Comparison</Title>
            <BarChart
              className="h-72 mt-6"
              data={monthlyData.slice(-3)}
              index="date"
              categories={["expenses", "income"]}
              colors={["purple", "cyan"]}
              valueFormatter={(number) => `$${number.toFixed(2)}`}
            />
          </Card>
        </motion.div>
      </motion.div>

      {/* Donut Chart */}
      <motion.div variants={cardVariants}>
        <Card className="shadow-lg border border-gray-700/50">
          <Title>Participant Debt Distribution</Title>
          <DonutChart
            className="h-80 mt-6"
            data={participantDebts}
            category="amount"
            index="name"
            valueFormatter={(number) => `$${number.toFixed(2)}`}
            colors={["cyan", "violet", "indigo"]}
          />
        </Card>
      </motion.div>

      {/* Backend API Test + Object Lookup */}
      <motion.div variants={cardVariants}>
        <Card className="shadow-lg border border-gray-700/50">
          <Title>Backend Test & Object Lookup</Title>
          <div className="mt-4 space-y-4">
            <button
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded"
              onClick={async () => {
                try {
                  const res = await fetch("http://localhost:5000/api/test");
                  const data = await res.json();
                  alert("Backend says: " + data.message);
                } catch (err) {
                  alert("Error: " + (err as Error).message);
                }
              }}
            >
              Ping Backend
            </button>

            <div>
              <input
                type="text"
                placeholder="Enter Sui Object ID"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                className="border rounded px-3 py-2 mr-2 bg-gray-900 text-white"
              />
              <button
                className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded"
                onClick={fetchObjectData}
              >
                Fetch Object
              </button>
            </div>

            {objectInfo && (
              <pre className="bg-black/40 text-green-300 p-3 rounded overflow-x-auto">
                {JSON.stringify(objectInfo, null, 2)}
              </pre>
            )}

            {lookupError && (
              <div className="text-red-400">{lookupError}</div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Card, Title, BarChart, DonutChart } from '@tremor/react';
// import { Activity, TrendingUp, Users } from 'lucide-react';
// import AnimatedLineChart from './AnimatedLineChart';
// import StatCard from './StatCard';
// import { useWallet } from '../../context/WalletContext';
// import { suiClient } from '../../utils/suiClient.ts'; // Import the newly created suiClient

// interface ExpenseData {
//   date: string;
//   expenses: number;
//   income: number;
// }

// interface ParticipantDebt {
//   name: string;
//   amount: number;
// }

// const Dashboard: React.FC = () => {
//   const { walletAddress, isConnected } = useWallet();
//   const [suiBalance, setSuiBalance] = useState<string | null>(null);
//   const [monthlyData, setMonthlyData] = useState<ExpenseData[]>([]);
//   const [participantDebts, setParticipantDebts] = useState<ParticipantDebt[]>([]);
//   const [lookupId, setLookupId] = useState('');
//   const [objectInfo, setObjectInfo] = useState<any>(null);
//   const [lookupError, setLookupError] = useState('');

//   // Fetch Sui Balance
//   useEffect(() => {
//     const fetchBalance = async () => {
//       if (!isConnected || !walletAddress) {
//         setSuiBalance('Not Connected');
//         return;
//       }
//       try {
//         const coins = await suiClient.getBalance({
//           owner: walletAddress,
//           coinType: '0x2::sui::SUI',
//         });
//         const balanceInSui = Number(coins.totalBalance) / 1_000_000_000;
//         setSuiBalance(balanceInSui.toFixed(2));
//       } catch (error) {
//         setSuiBalance('Error');
//       }
//     };
//     fetchBalance();
//   }, [walletAddress, isConnected]);

//   // Fetch Expense Group Data from Move Contract
//   useEffect(() => {
//     const fetchExpenseData = async () => {
//       if (!isConnected || !walletAddress) return;
//       try {
//         // Fetch objects owned by the wallet
//         const objects = await suiClient.getOwnedObjects({
//           owner: walletAddress,
//           options: { showContent: true },
//         });

//         // Filter for ExpenseGroup objects (from your sui_split.move)
//         const expenseGroups = objects.data.filter((obj: { data?: { type?: string; objectId: string } }) =>
//           obj.data?.type?.includes('::sui_split::ExpenseGroup')
//         );

//         const debts: ParticipantDebt[] = [];
//         const expensesByMonth: ExpenseData[] = [];
//         const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//         for (const group of expenseGroups) {
//           const groupData = await suiClient.getObject({
//             id: group.data.objectId,
//             options: { showContent: true },
//           });

//           const fields = groupData.data?.content?.fields;
//           if (fields) {
//             // Extract participants for debts
//             const participants = fields.participants?.fields?.contents || [];
//             participants.forEach((p: any, index: number) => {
//               debts.push({
//                 name: `Participant ${index + 1}`, // Replace with real names if stored in contract
//                 amount: Math.random() * 50, // Replace with real debt calculation
//               });
//             });

//             // Extract expenses for monthly data
//             const expenses = fields.expenses?.fields?.contents || [];
//             expenses.forEach((exp: any, index: number) => {
//               const monthIndex = (new Date().getMonth() - expenses.length + index + 1) % 12;
//               expensesByMonth.push({
//                 date: months[monthIndex],
//                 expenses: exp.fields.amount || 0, // Use real expense amount
//                 income: 0, // Add income logic if stored in contract
//               });
//             });
//           }
//         }

//         setParticipantDebts(debts.length > 0 ? debts : [{ name: 'No Data', amount: 0 }]);
//         setMonthlyData(expensesByMonth.length > 0 ? expensesByMonth.slice(-7) : [{ date: 'No Data', expenses: 0, income: 0 }]);
//       } catch (error) {
//         setParticipantDebts([{ name: 'Error', amount: 0 }]);
//         setMonthlyData([{ date: 'Error', expenses: 0, income: 0 }]);
//       }
//     };
//     fetchExpenseData();
//   }, [walletAddress, isConnected]);

//   const totalOwed = participantDebts.reduce((sum, debt) => sum + debt.amount, 0);

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
//   };

//   const cardVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
//     hover: { y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }
//   };

//   const fetchObjectData = async () => {
//     setLookupError('');
//     setObjectInfo(null);
//     try {
//       const res = await fetch(`http://localhost:5000/api/object/${lookupId}`);
//       const data = await res.json();
//       if (data.error) throw new Error(data.error);
//       setObjectInfo(data);
//     } catch (err) {
//       setLookupError((err as Error).message);
//     }
//   };

//   const coinIllustration = (
//     <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
//       <ellipse cx="24" cy="40" rx="16" ry="4" fill="#00D2D3" fillOpacity="0.18" />
//       <circle cx="24" cy="24" r="14" fill="#00D2D3" />
//       <circle cx="24" cy="24" r="10" fill="#fff" fillOpacity="0.9" />
//       <text x="24" y="29" textAnchor="middle" fontSize="16" fill="#00D2D3" fontWeight="bold">$</text>
//     </svg>
//   );

//   return (
//     <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 space-y-8">
//       <Card className="mb-4 bg-gradient-to-r from-cyan-700/40 to-cyan-900/40 border-cyan-500/30 shadow-lg">
//         <div className="flex items-center gap-4">
//           <img src="https://cryptologos.cc/logos/sui-sui-logo.png" alt="Sui" className="h-8 w-8" />
//           <div>
//             <div className="text-lg font-bold text-cyan-300">
//               Sui Balance ({walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not Connected'})
//             </div>
//             <div className="text-2xl font-mono text-white">{suiBalance || '0'} SUI</div>
//           </div>
//         </div>
//       </Card>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         <StatCard
//           title="Total Balance"
//           value={totalOwed}
//           prefix="$"
//           icon={<TrendingUp className="h-7 w-7 text-white" />}
//           gradientFrom="from-[#00D2D3]"
//           gradientTo="to-[#192a56]"
//           sparklineData={[50, 60, 55, 70, 68, 91, 92]}
//           illustration={coinIllustration}
//         />
//         <StatCard
//           title="Monthly Transactions"
//           value={monthlyData.length ? monthlyData[monthlyData.length - 1].expenses : 0}
//           suffix=" txns"
//           icon={<Activity className="h-7 w-7 text-white" />}
//           gradientFrom="from-[#6C5CE7]"
//           gradientTo="to-[#341f97]"
//           percentChange={+2.3}
//           percentColor="text-emerald-400"
//           sparklineData={[40, 60, 80, 120, 100, 140, 130]}
//         />
//         <StatCard
//           title="Active Participants"
//           value={participantDebts.length}
//           icon={<Users className="h-7 w-7 text-white" />}
//           gradientFrom="from-[#00B894]"
//           gradientTo="to-[#222f3e]"
//           avatars={participantDebts.map((p) => p.name[0])}
//         />
//       </div>

//       <motion.div variants={cardVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <motion.div variants={cardVariants}>
//           <Card className="shadow-lg border border-gray-700/50">
//             <Title>Monthly Expense Trends</Title>
//             <div className="h-72 mt-6">
//               <AnimatedLineChart
//                 data={monthlyData.map(d => ({ x: d.date, y: d.expenses }))}
//                 color="#6C5CE7"
//                 gradientFrom="#6C5CE7"
//                 gradientTo="#00D2D3"
//                 width={400}
//                 height={220}
//               />
//             </div>
//           </Card>
//         </motion.div>

//         <motion.div variants={cardVariants}>
//           <Card className="shadow-lg border border-gray-700/50">
//             <Title>Recent Expenses Comparison</Title>
//             <BarChart
//               className="h-72 mt-6"
//               data={monthlyData.slice(-3)}
//               index="date"
//               categories={["expenses", "income"]}
//               colors={["purple", "cyan"]}
//               valueFormatter={(number) => `$${number.toFixed(2)}`}
//             />
//           </Card>
//         </motion.div>
//       </motion.div>

//       <motion.div variants={cardVariants}>
//         <Card className="shadow-lg border border-gray-700/50">
//           <Title>Participant Debt Distribution</Title>
//           <DonutChart
//             className="h-80 mt-6"
//             data={participantDebts}
//             category="amount"
//             index="name"
//             valueFormatter={(number) => `$${number.toFixed(2)}`}
//             colors={["cyan", "violet", "indigo"]}
//           />
//         </Card>
//       </motion.div>

//       <motion.div variants={cardVariants}>
//         <Card className="shadow-lg border border-gray-700/50">
//           <Title>Backend Test & Object Lookup</Title>
//           <div className="mt-4 space-y-4">
//             <button
//               className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded"
//               onClick={async () => {
//                 try {
//                   const res = await fetch("http://localhost:5000/api/test");
//                   const data = await res.json();
//                   alert("Backend says: " + data.message);
//                 } catch (err) {
//                   alert("Error: " + (err as Error).message);
//                 }
//               }}
//             >
//               Ping Backend
//             </button>

//             <div>
//               <input
//                 type="text"
//                 placeholder="Enter Sui Object ID"
//                 value={lookupId}
//                 onChange={(e) => setLookupId(e.target.value)}
//                 className="border rounded px-3 py-2 mr-2 bg-gray-900 text-white"
//               />
//               <button
//                 className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded"
//                 onClick={fetchObjectData}
//               >
//                 Fetch Object
//               </button>
//             </div>

//             {objectInfo && (
//               <pre className="bg-black/40 text-green-300 p-3 rounded overflow-x-auto">
//                 {JSON.stringify(objectInfo, null, 2)}
//               </pre>
//             )}

//             {lookupError && (
//               <div className="text-red-400">{lookupError}</div>
//             )}
//           </div>
//         </Card>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default Dashboard;