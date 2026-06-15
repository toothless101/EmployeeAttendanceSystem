async function loadTotalEmployees(){
   await fetch('http://localhost:4000/dashboard/statistics')
    .then(res=>res.json())
    .then(data=>{
         document.getElementById('totalNumberOfEmployees').textContent =`${data.totalEmployees}`;
         document.getElementById('totalPresentToday').textContent= `${data.totalPresent}`;
         document.getElementById('totalNumberOfDepartments').textContent= `${data.departments}`;
        console.log(data.totalEmployees)
    })
}

function currentTimeDate(){
    const now = new Date()

    document.getElementById('currentTime').textContent =  now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true});
    document.getElementById ('currentDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function loadAttendance(){
    fetch('http://localhost:4000/attendance')
    .then(res => res.json())
    .then(attendance => {
        const attendanceTable = document.getElementById('attendanceTableBody');
        attendanceTable.innerHTML = '';

        attendance.forEach(record => {
            const dateFormat =  new Date(record.attendance_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-center text-[#1e2f3d]">${record.fullname}</td>
                <td class="px-6 py-4 text-center text-[#1e2f3d]">${record.position}</td>
                <td class="px-6 py-4 text-center text-[#1e2f3d]">${dateFormat}</td>
                <td class="px-6 py-4 text-center text-[#1e2f3d]">${record.time_in || '- -'}</td>
            `;
            attendanceTable.appendChild(row);
        });
    })
    .catch(error => {
        console.error("Error fetching attendance records:", error);
    });
}

async function loadChart(){
    const response = await fetch('http://localhost:4000/dashboard/chart')
    const data = await response.json();
        
        const xValues = ["Current Employee Attendance", "Total Number of Employees"];
        const yValues = [
            data.totalPresent,
            data.totalEmployees
        ]; 
        const barColors = [
        "#7E919F", // Current Employee Attendance
        "#354958"  // Total Number of Employees
    ];

        const ctx = document.getElementById('myChart');

        new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: xValues,
            datasets: [{
            backgroundColor: barColors,
            data: yValues
            }]
        },
        options: {
            plugins: {
            legend: {
                display:true,
                position: 'bottom'
            },
            title: {
                display: true,
                text: "Attendance Overview",
                font: {size:16},
            }
            }
        }
        });
}

loadChart();
setInterval(currentTimeDate, 1000);
loadTotalEmployees();
loadAttendance();
currentTimeDate();