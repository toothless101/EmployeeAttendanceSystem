function loadEmployees() {
    fetch('http://localhost:4000/employees')
    .then(res=>res.json())
    .then(employees =>{
        const employeeTableBody = document.getElementById('employeeTable');
        employeeTableBody.innerHTML = '';

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.classList.add(
                'text-center'
            )
            row.innerHTML = `
                <td><img src="http://localhost:4000/uploads/${employee.profile_image}" alt="Profile Image" style="width: 50px; height: 50px;" class="rounded-full"></td>
                <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${employee.fullname}</td>
                <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${employee.department_name}</td>
                <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${employee.email}</td>
                <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${employee.position}</td>
                <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">
                    <button class="edit-btn text-white bg-[#65A13A] box-border border border-transparent hover:bg-[#38780A] cursor-pointer  shadow-xs leading-5 rounded-lg text-xs px-2 py-.5 focus:outline-none" onclick="openUpdateModal(${employee.employee_id})">Edit</button>
                    <button class="delete-btn text-white bg-[#dc2626] box-border border border-transparent hover:bg-[#b31717] cursor-pointer shadow-xs  leading-5 rounded-lg text-xs px-2 py-.5 focus:outline-none" onclick="deleteEmployee(${employee.employee_id})">Delete</button>
                </td>            `;
            employeeTableBody.appendChild(row);
        });
    })
}

const addEmployeeBtn = document.getElementById('addEmployeeBtn')
const employeeModal = document.getElementById('addEmployeeModal')
const closeBtn = document.querySelector('.close');
closeBtn.style.cursor = 'pointer';
closeBtn.addEventListener('click', function() {
  employeeModal.style.display = 'none';
});
addEmployeeBtn.addEventListener('click', () => {
    employeeModal.style.display = 'flex'
})


//get all department and populate the dropdown
function loadDepartmentDropdown(){
    fetch('http://localhost:4000/departments')
    .then(res=>res.json())
    .then(departments =>{
        const departmentSelect = document.getElementById('department_id');
        const updateDepartmentSelect = document.getElementById('updateDepartment_id');
        
        // Clear both dropdowns
        departmentSelect.innerHTML = '<option value="">Select Department</option>';
        updateDepartmentSelect.innerHTML = '<option value="">Select Department</option>';
        
        // Populate both dropdowns
        departments.forEach(department => {
            const option1 = document.createElement('option');
            option1.value = department.department_id;
            option1.textContent = department.department_name;
            departmentSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = department.department_id;
            option2.textContent = department.department_name;
            updateDepartmentSelect.appendChild(option2);
        });
    }).catch(error => {
        console.error("Error fetching departments for dropdown:", error);
    });
}

//add employee form
const employeeForm = document.getElementById('addEmployeeForm');
employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('fullname', document.getElementById('fullname').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('phone_number', document.getElementById('phone_number').value);
    formData.append('department_id', document.getElementById('department_id').value);
    formData.append('position', document.getElementById('position').value);

    const imageFile = document.getElementById('profile_image').files[0];

    if (imageFile) {
        formData.append('profile_image', imageFile);
    }

    try {
        const response = await fetch('http://localhost:4000/employees', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        console.log(data);
        alert('Employee added successfully!');
        loadEmployees();
        employeeForm.reset();
        employeeModal.style.display = 'none';

    } catch (error) {
        console.error('Error adding employee:', error);
    }
});


const updateEmployeeForm = document.getElementById('updateEmployeeForm');
const updateEmployeeModal = document.getElementById('updateEmployeeModal');
const cancleBtn = document.querySelector('.updateclose');
cancleBtn.style.cursor = 'pointer';
cancleBtn.addEventListener('click', function() {
  updateEmployeeModal.style.display = 'none';
});

window.openUpdateModal = function(id) {
    fetch(`http://localhost:4000/employees/${id}`)
    .then(res => res.json())
    .then(employee => {
        updateEmployeeModal.style.display = "flex";
        console.log(employee);
        document.getElementById('updateId').value = employee.employee_id;
        document.getElementById('updateFullname').value = employee.fullname;
        document.getElementById('updateEmail').value = employee.email;
        document.getElementById('updatePhone_number').value = employee.phone_number;
        document.getElementById('updateDepartment_id').value = employee.department_id;
        document.getElementById('updatePosition').value = employee.position;
        document.getElementById('currentProfileImage').src = `http://localhost:4000/uploads/${employee.profile_image}`;
    })
    .catch(error => {
        console.error(error);
        alert("Failed to fetch employee data");
        updateEmployeeModal.style.display = "none";
    });
}

updateEmployeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('updateId').value;

    const formData = new FormData();

    formData.append('fullname', document.getElementById('updateFullname').value);
    formData.append('email', document.getElementById('updateEmail').value);
    formData.append('phone_number', document.getElementById('updatePhone_number').value);
    formData.append('department_id', document.getElementById('updateDepartment_id').value);
    formData.append('position', document.getElementById('updatePosition').value);

    const imageFile = document.getElementById('updateProfile_image').files[0];

    if (imageFile) {
        formData.append('profile_image', imageFile);
    }

    try {
        const response = await fetch(`http://localhost:4000/employees/${id}`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();

        console.log(data);
        alert('Employee updated successfully!');
        loadEmployees();
        updateEmployeeModal.style.display = 'none';

    } catch (error) {
        console.error('Error updating employee:', error);
    }
});

window.deleteEmployee = function(id){
    if(!confirm('Are you sure you want to delete this employee?')){
        return;
    }
    fetch(`http://localhost:4000/employees/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            alert('Employee deleted successfully!');
            loadEmployees();
        } else {
            alert('Failed to delete employee');
        }
    })
    .catch(error => {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee');
    });
}

loadEmployees();
loadDepartmentDropdown();