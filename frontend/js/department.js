function loadDepartments(){
    fetch('http://localhost:4000/departments')
    .then(res=>res.json())
    .then(departments=>{
        const departmentTable = document.getElementById('departmentTable');
        departmentTable.innerHTML = '';

        departments.forEach(department => {
            const row = document.createElement('tr');
             row.classList.add(
                'text-center'
            )
            row.innerHTML = `
                <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${department.department_id}</td>
                <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${department.department_name}</td>
                <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">${department.description}</td>
                <td class="px-6 py-3 font-medium text-center text-[#1e2f3d]">
                    <button class="edit-btn text-white bg-[#65A13A] box-border border border-transparent hover:bg-[#38780A] cursor-pointer focus:ring-4 focus:ring-success-medium shadow-xs font-medium leading-5 rounded-2xl text-sm px-4 py-2.5 focus:outline-none" onclick="openUpdateModal(${department.department_id})">Edit</button>
                    <button class="delete-btn text-white bg-[#dc2626] box-border border border-transparent hover:bg-[#b31717] cursor-pointer focus:ring-4 focus:ring-danger-medium shadow-xs font-medium leading-5 rounded-2xl text-sm px-4 py-2.5 focus:outline-none" onclick="deleteDepartment(${department.department_id})">Delete</button>
                </td>
                
            `;
            departmentTable.appendChild(row);
        });
    })
}

const form = document.getElementById('addDepartmentForm');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const department_name = document.getElementById('departmentName').value;
    const description = document.getElementById('description').value;

    fetch('http://localhost:4000/departments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ department_name, description })
    })
    .then(res => res.json())
    .then(newDepartment => {
        console.log('Department added:', newDepartment);
        loadDepartments();
        form.reset();
    })
})

const addDepartmentBtn = document.getElementById('addDepartmentBtn')

const departmentModal = document.getElementById('addDepartmentModal')

const closeBtn = document.querySelector('.close');
closeBtn.style.cursor = 'pointer';

closeBtn.addEventListener('click', function() {
  departmentModal.style.display = 'none';
});

addDepartmentBtn.addEventListener('click', () => {
    departmentModal.style.display = 'flex'
})

const updateDepartmentModal = document.getElementById('updateDepartmentModal');
const updateCloseBtn = document.querySelector('.updateclose');
updateCloseBtn.style.cursor = 'pointer';
updateCloseBtn.addEventListener('click', function() {
  updateDepartmentModal.style.display = 'none';
});

window.openUpdateModal = function(id) {
  fetch(`http://localhost:4000/departments/${id}`)
    .then(res => res.json())
    .then(department => {
      updateDepartmentModal.style.display = "flex";
      console.log(department);
      document.getElementById('updateId').value = department.department_id;
      document.getElementById('updateName').value = department.department_name;
      document.getElementById('updateDescription').value = department.description;
    })
    .catch(error => {
      console.error(error);
      alert("Failed to fetch department data");
    });
}

const updateModalForm = document.getElementById('updateDepartmentForm');

updateModalForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const id = document.getElementById('updateId').value;
    const department_name = document.getElementById('updateName').value;
    const description = document.getElementById('updateDescription').value;

    fetch(`http://localhost:4000/departments/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ department_name, description })
    })
    .then(res => res.json())
    .then(updatedDepartment => {
        console.log('Department updated:', updatedDepartment);
        alert("Department updated successfully");
        loadDepartments();
        updateDepartmentModal.style.display = 'none';
    });
});

function deleteDepartment(id){
    if(!confirm('Are you sure you want to delete this department?')){
        return;
    }
    fetch(`http://localhost:4000/departments/${id}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(result => {
        console.log('Department deleted:', result);
        alert("Department deleted successfully");
        loadDepartments();
    })
    .catch(error => {
        console.error("Error deleting department:", error);
        alert("Failed to delete department");
    });
}

loadDepartments()