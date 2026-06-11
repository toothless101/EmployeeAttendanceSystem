function loadAttendance(){
    fetch('http://localhost:4000/attendance')
    .then(res => res.json())
    .then(attendance => {
        const attendanceTable = document.getElementById('attendanceTableBody');
        attendanceTable.innerHTML = '';

        attendance.forEach(record => {
            const dateFormat =  new Date(record.attendance_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-center text-[#1e2f3d]">${record.fullname}</td>
                <td class="px-6 py-4 text-center text-[#1e2f3d]">${record.position}</td>
                <td class="px-6 py-4 text-center text-[#1e2f3d]">${dateFormat}</td>
                <td class="px-6 py-4 text-center text-[#1e2f3d]">${record.time_in || '- -'}</td>
                <td class="px-6 py-4 text-center text-[#1e2f3d]">${record.time_out || '- -'}</td>
                <td class="px-6 py-4 text-center font-bold ${record.status === 'Present' ? 'text-green-500' : record.status === 'Late' ? 'text-red-500' : record.status === 'Leave' ? 'text-blue-500' : 'text-gray-500'}">${record.status}</td>
            `;
            attendanceTable.appendChild(row);
        });
    })
    .catch(error => {
        console.error("Error fetching attendance records:", error);
    });
}

let selectedEmployeeId =  null;

//search employee by name
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', async() => {
    const keyword = searchInput.value.trim();
    if (keyword.length < 2) {
        searchResults.innerHTML = 'No Employee Found';
        clearEmployeeInfo();
        return;
    }

    const response = await fetch(`http://localhost:4000/attendance/search?keyword=${(keyword)}`);

    const employees = await response.json();
    searchResults.innerHTML = employees.map(employee => `<div class="employee-item bg-gray-200 hover:bg-gray-300 p-2 mb-2 cursor-pointer" data-id="${employee.employee_id}">${employee.fullname}</div>`).join('');
});

const timeInbtn = document.getElementById('time_in');
const timeOutbtn = document.getElementById('time_out');
const leavebtn = document.getElementById('leave');

//display the clicked search result to the card
searchResults.addEventListener('click', async(e) => {
    const item = e.target.closest('.employee-item');
    if(!item) return;

    const id = item.dataset.id;

    const response = await fetch(`http://localhost:4000/employees/${id}`);

    const employee = await response.json();

    selectedEmployeeId = employee.employee_id;

    document.getElementById('employeeName').textContent = employee.fullname;
    document.getElementById('employeeEmail').textContent = employee.email;
    document.getElementById('employeeDepartment').textContent = employee.department_name;
    document.getElementById('employeePosition').textContent = employee.position;
    const employeeProfileImage = document.getElementById('employeeProfileImage');
    employeeProfileImage.src = employee.profile_image ? `http://localhost:4000/uploads/${employee.profile_image}` : '';
    loadStatistics(selectedEmployeeId);
    searchInput.value = employee.fullname;
    searchResults.innerHTML = '';

    timeInbtn.style.display = 'flex';
    timeOutbtn.style.display = 'flex';
    leavebtn.style.display = 'flex';

});

//function to clear the employee details card when search input is cleared
function clearEmployeeInfo() {

    selectedEmployeeId = null;

    document.getElementById('employeeName').textContent = '';
    document.getElementById('employeeEmail').textContent = '';
    document.getElementById('employeeDepartment').textContent = '';
    document.getElementById('employeePosition').textContent = '';

    document.getElementById('employeeProfileImage').src = '';
    document.getElementById('employeeProfileImage').style.display = '';

    timeInbtn.style.display = 'none';
    timeOutbtn.style.display = 'none';
    leavebtn.style.display = 'none';

    searchResults.innerHTML = '';
}

const time_inBtn = document.getElementById('time_in');
const time_outBtn = document.getElementById('time_out');
const leaveBtn = document.getElementById('leave');

time_inBtn.addEventListener('click', async() => {
    time_outBtn.disabled = true;
    if(!selectedEmployeeId) 
        return alert('Please select an employee first');


    const response = await fetch(`http://localhost:4000/attendance/time_in`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employee_id: selectedEmployeeId })
    });

    const result = await response.json();
    alert(result.message); 
    loadAttendance();
    loadStatistics(selectedEmployeeId);
    time_outBtn.disabled = true;
    leaveBtn.disabled = true;


});

//time-out
time_outBtn.addEventListener('click', async()=>{
    time_outBtn.disabled = false;
    time_inBtn.disabled = true;
    leaveBtn.disabled = true;

    const response = await fetch(`http://localhost:4000/attendance/time_out`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employee_id: selectedEmployeeId })
    });

    const result = await response.json();
    alert(result.message);
    loadAttendance();
    loadStatistics(selectedEmployeeId);
    time_inBtn.disabled = true;
    leaveBtn.disabled = true;
    time_outBtn.disabled = true;

});

//leave status
leaveBtn.addEventListener('click', async() =>{
    leaveBtn.disabled = false;
    time_inBtn.disabled = false;
    time_outBtn.disabled = true;
    const response = await fetch(`http://localhost:4000/attendance/leave`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employee_id: selectedEmployeeId })
    });
    const result = await response.json();
    alert(result.message);
    loadAttendance();
    loadStatistics(selectedEmployeeId);
    leaveBtn.disabled = true;
    time_inBtn.disabled = true;
    time_outBtn.disabled = true;
})

//employee statistics
async function loadStatistics(employee_id) {

    const response = await fetch(
        `http://localhost:4000/attendance/statistics/${employee_id}`
    );

    const stats = await response.json();

    document.getElementById('presentCount').textContent =
        `${stats.present} Days`;

    document.getElementById('lateCount').textContent =
        `${stats.late} Days`;

    document.getElementById('leaveCount').textContent =
        `${stats.leave} Days`;

    document.getElementById('absentCount').textContent =
        `${stats.absent} Days`;
}


loadAttendance();