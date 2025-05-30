// Global variables
let people = [];
let workItems = [];
let sections = [];
let roleTemplates = [];

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Work Schedule Tool...');
    loadRoleTemplates();
    updateRoleTemplatesList();
    updateRoleTemplateDropdown();
});

// Make all functions available globally
window.showTab = showTab;
window.addRoleTemplate = addRoleTemplate;
window.removeRoleTemplate = removeRoleTemplate;
window.editRoleTemplate = editRoleTemplate;
window.bulkUpdateRates = bulkUpdateRates;
window.fillFromTemplate = fillFromTemplate;
window.addPerson = addPerson;
window.removePerson = removePerson;
window.previewImport = previewImport;
window.importStructure = importStructure;
window.clearImport = clearImport;
window.createSection = createSection;
window.removeSection = removeSection;
window.addNewWorkItem = addNewWorkItem;
window.addPersonToWorkItem = addPersonToWorkItem;
window.editWorkItem = editWorkItem;
window.saveWorkItemEdit = saveWorkItemEdit;
window.cancelWorkItemEdit = cancelWorkItemEdit;
window.removeWorkItem = removeWorkItem;
window.exportToCSV = exportToCSV;

// Tab functionality
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Role Templates Management
function saveRoleTemplates() {
    try {
        localStorage.setItem('workScheduleRoleTemplates', JSON.stringify(roleTemplates));
        console.log('Role templates saved:', roleTemplates);
    } catch (e) {
        console.error('Failed to save role templates:', e);
    }
}

function loadRoleTemplates() {
    try {
        const saved = localStorage.getItem('workScheduleRoleTemplates');
        if (saved) {
            roleTemplates = JSON.parse(saved);
            console.log('Loaded role templates from storage:', roleTemplates);
        } else {
            // Default templates if none exist
            roleTemplates = [
                { id: Date.now(), name: 'Senior Consultant', rate: 650 },
                { id: Date.now() + 1, name: 'Junior Consultant', rate: 450 },
                { id: Date.now() + 2, name: 'Project Manager', rate: 550 },
                { id: Date.now() + 3, name: 'Business Analyst', rate: 500 }
            ];
            console.log('Created default role templates:', roleTemplates);
            saveRoleTemplates();
        }
    } catch (e) {
        console.error('Failed to load role templates:', e);
        // Fallback to defaults if localStorage fails
        roleTemplates = [
            { id: Date.now(), name: 'Senior Consultant', rate: 650 },
            { id: Date.now() + 1, name: 'Junior Consultant', rate: 450 },
            { id: Date.now() + 2, name: 'Project Manager', rate: 550 },
            { id: Date.now() + 3, name: 'Business Analyst', rate: 500 }
        ];
    }
}

function addRoleTemplate() {
    const name = document.getElementById('role-name').value.trim();
    const rate = parseFloat(document.getElementById('role-rate').value);

    if (!name || !rate) {
        alert('Please fill in all fields');
        return;
    }

    const roleTemplate = {
        id: Date.now(),
        name: name,
        rate: rate
    };

    roleTemplates.push(roleTemplate);
    saveRoleTemplates();
    updateRoleTemplatesList();
    updateRoleTemplateDropdown();

    // Clear form
    document.getElementById('role-name').value = '';
    document.getElementById('role-rate').value = '';
}

function removeRoleTemplate(id) {
    roleTemplates = roleTemplates.filter(template => template.id !== id);
    saveRoleTemplates();
    updateRoleTemplatesList();
    updateRoleTemplateDropdown();
}

function editRoleTemplate(id) {
    const template = roleTemplates.find(t => t.id === id);
    if (!template) return;

    const newRate = prompt(`Enter new day rate for ${template.name}:`, template.rate);
    if (newRate && !isNaN(parseFloat(newRate))) {
        template.rate = parseFloat(newRate);
        saveRoleTemplates();
        updateRoleTemplatesList();
        updateRoleTemplateDropdown();
    }
}

function updateRoleTemplatesList() {
    const list = document.getElementById('role-templates-list');
    list.innerHTML = '';

    if (roleTemplates.length === 0) {
        list.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">No role templates yet. Add some above!</p>';
        return;
    }

    roleTemplates.forEach(template => {
        const item = document.createElement('div');
        item.className = 'role-template-item';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="font-size: 1.1em;">${template.name}</strong>
                    <br><span class="currency">£${template.rate.toFixed(2)}/day</span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="editRoleTemplate(${template.id})" style="padding: 8px 16px; font-size: 14px;">Edit Rate</button>
                    <button class="btn btn-danger" onclick="removeRoleTemplate(${template.id})" style="padding: 8px 16px; font-size: 14px;">Remove</button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

function updateRoleTemplateDropdown() {
    const dropdown = document.getElementById('person-template');
    dropdown.innerHTML = '<option value="">-- Select a role template --</option>';
    
    roleTemplates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} - £${template.rate.toFixed(2)}/day`;
        dropdown.appendChild(option);
    });
}

function fillFromTemplate() {
    const templateId = document.getElementById('person-template').value;
    if (!templateId) {
        document.getElementById('person-role').value = '';
        document.getElementById('person-rate').value = '';
        return;
    }

    const template = roleTemplates.find(t => t.id === parseInt(templateId));
    if (template) {
        document.getElementById('person-role').value = template.name;
        document.getElementById('person-rate').value = template.rate;
    }
}

function bulkUpdateRates() {
    const percentage = parseFloat(document.getElementById('rate-increase').value);
    if (isNaN(percentage)) {
        alert('Please enter a valid percentage');
        return;
    }

    const multiplier = 1 + (percentage / 100);
    roleTemplates.forEach(template => {
        template.rate = Math.round(template.rate * multiplier * 100) / 100;
    });

    saveRoleTemplates();
    updateRoleTemplatesList();
    updateRoleTemplateDropdown();
    
    alert(`All rates updated by ${percentage}%`);
    document.getElementById('rate-increase').value = '';
}

// People Management
function addPerson() {
    const name = document.getElementById('person-name').value.trim();
    const role = document.getElementById('person-role').value.trim();
    const rate = parseFloat(document.getElementById('person-rate').value);

    if (!name || !role || !rate) {
        alert('Please fill in all fields');
        return;
    }

    const person = {
        id: Date.now(),
        name: name,
        role: role,
        rate: rate
    };

    people.push(person);
    updatePeopleList();
    updateSectionsList();
    
    // Clear form
    document.getElementById('person-name').value = '';
    document.getElementById('person-role').value = '';
    document.getElementById('person-rate').value = '';
    document.getElementById('person-template').value = '';
}

function removePerson(id) {
    people = people.filter(person => person.id !== id);
    updatePeopleList();
    updateSectionsList();
}

function updatePeopleList() {
    const list = document.getElementById('people-list');
    list.innerHTML = '';

    people.forEach(person => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div>
                <strong>${person.name}</strong> - ${person.role}
                <br><span class="currency">£${person.rate.toFixed(2)}/day</span>
            </div>
            <button class="btn btn-danger" onclick="removePerson(${person.id})">Remove</button>
        `;
        list.appendChild(item);
    });
}

// Import/Export Functions
function previewImport() {
    const text = document.getElementById('import-text').value.trim();
    
    if (!text) {
        alert('Please paste some text to preview');
        return;
    }
    
    const parsed = parseImportText(text);
    
    if (parsed.sections.length === 0) {
        alert('No valid structure detected. Make sure sections are in the left column and work items are indented (tabbed) in the right column.');
        return;
    }
    
    const previewDiv = document.getElementById('import-preview');
    const contentDiv = document.getElementById('preview-content');
    
    let previewHtml = '';
    parsed.sections.forEach(section => {
        previewHtml += `<div style="margin-bottom: 15px;">`;
        previewHtml += `<strong style="color: #2c3e50; font-size: 1.1em;">${section.name}</strong>`;
        if (section.workItems.length > 0) {
            previewHtml += `<ul style="margin: 8px 0 0 20px; color: #6c757d;">`;
            section.workItems.forEach(workItem => {
                previewHtml += `<li>${workItem}</li>`;
            });
            previewHtml += `</ul>`;
        } else {
            previewHtml += `<div style="margin-left: 20px; color: #6c757d; font-style: italic;">No work items</div>`;
        }
        previewHtml += `</div>`;
    });
    
    contentDiv.innerHTML = previewHtml;
    previewDiv.style.display = 'block';
}

function parseImportText(text) {
    const lines = text.split('\n').map(line => line.replace(/\r/g, ''));
    const sections = [];
    let currentSection = null;
    
    lines.forEach(line => {
        if (!line.trim()) return;
        
        if (line.match(/^\s+/)) {
            const workItem = line.trim();
            if (currentSection && workItem) {
                currentSection.workItems.push(workItem);
            }
        } else {
            const sectionName = line.trim();
            if (sectionName) {
                currentSection = {
                    name: sectionName,
                    workItems: []
                };
                sections.push(currentSection);
            }
        }
    });
    
    return { sections };
}

function importStructure() {
    const text = document.getElementById('import-text').value.trim();
    
    if (!text) {
        alert('Please paste some text to import');
        return;
    }
    
    const parsed = parseImportText(text);
    
    if (parsed.sections.length === 0) {
        alert('No valid structure detected. Make sure sections are in the left column and work items are indented (tabbed) in the right column.');
        return;
    }
    
    let addedSections = 0;
    let skippedSections = 0;
    
    parsed.sections.forEach(parsedSection => {
        if (!sections.includes(parsedSection.name)) {
            sections.push(parsedSection.name);
            addedSections++;
        } else {
            skippedSections++;
        }
    });
    
    parsed.sections.forEach(parsedSection => {
        parsedSection.workItems.forEach(workItemName => {
            const existingWorkItem = workItems.find(item => 
                item.section === parsedSection.name && 
                item.description === workItemName
            );
            
            if (!existingWorkItem) {
                const placeholderWorkItem = {
                    id: Date.now() + Math.random(),
                    section: parsedSection.name,
                    description: workItemName,
                    personId: null,
                    personName: 'Unassigned',
                    personRole: '',
                    personRate: 0,
                    days: 0,
                    cost: 0,
                    isPlaceholder: true
                };
                