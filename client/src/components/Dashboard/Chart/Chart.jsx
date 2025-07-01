import {
    ComposedChart,
    Line,
    Area,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
const Chart = () => {
    const chartData=[
        {
        date:'1/12/2024',
        quantity:123,
        prices:1500,
        orders:44
        
    }]
  
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                width={500}
                height={400}
                data={chartData}
                margin={{
                    top: 20,
                    right: 80,
                    bottom: 20,
                    left: 20,
                }}
            >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="date" label={{ value: 'Pages', position: 'insideBottomRight', offset: 0 }} scale="band" />
                <YAxis label={{ value: 'Index', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="orders" fill="#8884d8" stroke="#8884d8" />
                <Bar dataKey="prices" barSize={20} fill="#413ea0" />
                <Line type="monotone" dataKey="quantity" stroke="#ff7300" />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default Chart;