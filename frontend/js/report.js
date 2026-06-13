//display current date
const reportDate = document.getElementById('reportDate');
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); 

reportDate.value = today.toISOString().split('T')[0];

async function loadReport(){

    const date = reportDate.value;

    const reportdate = document.getElementById('printDate');
    reportdate.textContent = date;
    
    try{
        const response = await fetch(`http://localhost:4000/attendance/report?date=${date}`);
        const records = await response.json();
        console.log(records);
        const tableBody = document.getElementById('reportTable');
        tableBody.innerHTML = '';

        records.forEach(record=>{
            tableBody.innerHTML += `
                <tr>
                    <td class="px-4 py-3 align-center"><img src="http://localhost:4000/uploads/${record.profile_image}" alt="Profile Image" style="width: 50px; height: 50px;" class="rounded-full"></td>
                    <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${record.fullname}</td>
                    <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${record.department_name}</td>
                    <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${record.position}</td>
                    <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${record.time_in ?? '-'}</td>
                    <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${record.time_out ?? '-'}</td>
                    <td class="px-6 py-4 text-center font-bold ${record.status === 'Present' ? 'text-green-500' : record.status === 'Late' ? 'text-red-500' : record.status === 'Leave' ? 'text-blue-500' : 'text-gray-500'}">${record.status}</td>
                </tr>  
            `
        })
    } catch(error){
        console.error(error)
    }
}

document.getElementById('searchReportBtn').addEventListener(
    'click', loadReport
);

document.getElementById('printBtn').addEventListener('click', () => {
    window.print();

});

document.getElementById('printBtn').addEventListener('click', () => {

    document.getElementById('printDate').textContent = reportDate.value;

    window.print();

});

loadReport();