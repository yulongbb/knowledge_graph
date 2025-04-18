document.addEventListener('DOMContentLoaded', function() {
    // 知识图谱按钮事件
    const buttons = {
        'btn-duan': '端',
        'btn-hui': '汇',
        'btn-rong': '融',
        'btn-guan': '管',
        'btn-kong': '控'
    };

    for (let [id, name] of Object.entries(buttons)) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                alert(`您点击了${name}模块`);
            });
        }
    }

    const editBtn = document.getElementById('btn-edit');
    const tagBtn = document.getElementById('btn-tag');
    const propBtn = document.getElementById('btn-prop');
    const editForm = document.getElementById('editForm');
    const editFormContent = document.getElementById('editFormContent');
    const tagFormContent = document.getElementById('tagFormContent');
    const propFormContent = document.getElementById('propFormContent');
    const saveButton = document.getElementById('saveButton');
    const propertiesList = document.getElementById('propertiesList');
    
    let currentData = null;
    let currentTags = new Set();

    // 初始化时隐藏表单区域
    editForm.style.display = 'none';

    // 更新按钮状态
    function updateButtonStates(hasId) {
        // 只在没有 ID 时保持知识录入按钮启用，其他禁用
        tagBtn.disabled = !hasId;
        propBtn.disabled = !hasId;
        
        // 更新按钮样式
        [tagBtn, propBtn].forEach(btn => {
            if (!hasId) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.style.background = 'linear-gradient(135deg, #cccccc, #999999)';
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.style.background = 'linear-gradient(135deg, #1e88e5, #1565c0)';
            }
        });
    }

    // 初始化时禁用按钮
    updateButtonStates(false);

    // 检查当前URL并初始化按钮状态
    async function initializeButtonStates() {
        try {
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const currentTab = tabs[0];
            const url = new URL(currentTab.url);
            let id = null;
            
            const pathSegments = url.pathname.split('/');
            if (pathSegments.includes('info') || pathSegments.includes('edit')) {
                id = pathSegments[pathSegments.length - 1];
            }

            // 更新按钮状态和文本
            updateButtonStates(!!id);
            editBtn.textContent = id ? '知识编辑' : '知识录入';
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    // 初始化按钮状态
    initializeButtonStates();

    // 只在标注模式下添加标签相关事件监听
    function initializeTagEvents() {
        const tagsInput = document.getElementById('tags');
        const tagsContainer = document.getElementById('tagsContainer');
        
        if (tagsInput && tagsContainer) {
            tagsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const tag = tagsInput.value.trim();
                    if (tag) {
                        currentTags.add(tag);
                        tagsInput.value = '';
                        renderTags();
                        updateTags();
                    }
                }
            });

            tagsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove')) {
                    const tag = e.target.dataset.tag;
                    currentTags.delete(tag);
                    renderTags();
                    updateTags();
                }
            });
        }
    }

    function renderTags() {
        const tagsContainer = document.getElementById('tagsContainer');
        tagsContainer.innerHTML = '';
        currentTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove" data-tag="${tag}">×</span>
            `;
            tagsContainer.appendChild(tagElement);
        });
    }

    // 移除JSON显示部分
    function updateTags() {
        if (currentData) {
            currentData._source.tags = Array.from(currentTags);
        }
    }

    async function fetchProperties(id) {
        const response = await fetch(`http://localhost:4200/api/knowledge/link/${id}/50/1`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})  // Send empty object as body
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    async function fetchPropertyOptions() {
        const response = await fetch('http://localhost:4200/api/properties/50/1', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "filter": [{
                    "field": "id",
                    "value": ["dd2a65f6-5aa4-44db-b9e6-41c65bc75c82"],
                    "relation": "schemas",
                    "operation": "IN"
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    function populatePropertySelect(properties) {
        const select = document.getElementById('propertySelect');
        select.innerHTML = '<option value="">选择属性...</option>';
        properties.list.forEach(prop => {
            const option = document.createElement('option');
            option.value = prop.id;
            option.textContent = prop.name;
            option.dataset.name = prop.name;
            select.appendChild(option);
        });
    }

    function renderProperties(data) {
        propertiesList.innerHTML = '';
        data.list.forEach(item => {
            const edge = item.edges[0];
            if (edge && edge.mainsnak) {
                addPropertyToList(
                    edge.mainsnak.label || '',
                    edge.mainsnak.datavalue?.value || '',
                    edge.mainsnak.property,
                    edge._id
                );
            }
        });
    }

    function addPropertyToList(label, value, propertyId, edgeId) {
        const div = document.createElement('div');
        div.className = 'property-item';
        div.innerHTML = `
            <span class="property-label">${label}</span>
            <input type="text" class="property-value" 
                   data-property="${propertyId}"
                   value="${value}"
                   data-edge-id="${edgeId || 'new'}">
            <div class="property-actions">
                <span class="property-action-btn edit-btn" title="编辑">✎</span>
                <span class="property-action-btn delete-btn" title="删除">✕</span>
            </div>
        `;

        // Add event listeners
        const input = div.querySelector('.property-value');
        const editBtn = div.querySelector('.edit-btn');
        const deleteBtn = div.querySelector('.delete-btn');
        
        input.disabled = true;
        
        editBtn.addEventListener('click', () => {
            input.disabled = !input.disabled;
            input.focus();
        });
        
        deleteBtn.addEventListener('click', () => {
            div.remove();
        });

        propertiesList.appendChild(div);
    }

    editBtn.addEventListener('click', async () => {
        try {
            // Hide file upload section when edit button is clicked
            const fileUploadSection = document.getElementById('fileUploadSection');
            fileUploadSection.style.display = 'none';
            
            editFormContent.style.display = 'block';
            tagFormContent.style.display = 'none';
            propFormContent.style.display = 'none';

            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const currentTab = tabs[0];
            
            const url = new URL(currentTab.url);
            let id = null;
            
            // Check for specific routes that contain ID
            const pathSegments = url.pathname.split('/');
            if (pathSegments.includes('info') || pathSegments.includes('edit')) {
                id = pathSegments[pathSegments.length - 1];
            }

            // 更新按钮状态
            updateButtonStates(!!id);
            // 根据是否有ID更改按钮文本
            editBtn.textContent = id ? '知识编辑' : '知识录入';

            if (!id) {
                currentData = {
                    _source: {
                        labels: { zh: { value: '' } },
                        descriptions: { zh: { value: '' } },
                        aliases: { zh: [{ value: '' }] },
                        tags: []
                    }
                };
            } else {
                const response = await fetch(`http://localhost:4200/api/knowledge/get/${id}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                currentData = await response.json();
            }
            
            editForm.style.display = 'block';
            
            const labelZh = document.getElementById('labelZh');
            const descriptionZh = document.getElementById('descriptionZh');
            const aliasZh = document.getElementById('aliasZh');

            if (labelZh) labelZh.value = currentData._source?.labels?.zh?.value || '';
            if (descriptionZh) descriptionZh.value = currentData._source?.descriptions?.zh?.value || '';
            if (aliasZh) aliasZh.value = currentData._source?.aliases?.zh?.[0]?.value || '';
            
            currentTags = new Set(currentData._source?.tags || []);
            renderTags();
        } catch (error) {
            console.error('详细错误信息:', error);
            alert(`获取数据失败：${error.message}`);
        }
    });

    tagBtn.addEventListener('click', async () => {
        if (tagBtn.disabled) return;
        try {
            // Hide file upload section when tag button is clicked
            const fileUploadSection = document.getElementById('fileUploadSection');
            fileUploadSection.style.display = 'none';
            
            editFormContent.style.display = 'none';
            tagFormContent.style.display = 'block';
            propFormContent.style.display = 'none';
            initializeTagEvents();

            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const currentTab = tabs[0];
            
            const url = new URL(currentTab.url);
            const pathSegments = url.pathname.split('/');
            const id = pathSegments[pathSegments.length - 1];

            if (!id) {
                throw new Error('无法从URL获取ID');
            }

            const response = await fetch(`http://localhost:4200/api/knowledge/get/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            currentData = await response.json();
            
            editForm.style.display = 'block';
            currentTags = new Set(currentData._source?.tags || []);
            renderTags();
        } catch (error) {
            console.error('详细错误信息:', error);
            alert(`获取数据失败：${error.message}`);
        }
    });

    propBtn.addEventListener('click', async () => {
        if (propBtn.disabled) return;
        try {
            // Hide file upload section when property button is clicked
            const fileUploadSection = document.getElementById('fileUploadSection');
            fileUploadSection.style.display = 'none';
            
            editFormContent.style.display = 'none';
            tagFormContent.style.display = 'none';
            propFormContent.style.display = 'block';
            editForm.style.display = 'block';

            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const currentTab = tabs[0];
            const url = new URL(currentTab.url);
            const id = url.pathname.split('/').pop();

            if (!id) throw new Error('无法获取ID');

            const data = await fetchProperties(id);
            renderProperties(data);

            const propertyOptions = await fetchPropertyOptions();
            populatePropertySelect(propertyOptions);
            
            const addPropertyBtn = document.getElementById('addPropertyBtn');
            const propertySelect = document.getElementById('propertySelect');
            const propertyValue = document.getElementById('propertyValue');
            
            addPropertyBtn.addEventListener('click', () => {
                const selectedOption = propertySelect.selectedOptions[0];
                const value = propertyValue.value.trim();
                
                if (selectedOption && selectedOption.value && value) {
                    addPropertyToList(
                        selectedOption.dataset.name,
                        value,
                        `P${selectedOption.value}`
                    );
                    propertySelect.value = '';
                    propertyValue.value = '';
                }
            });
        } catch (error) {
            console.error('获取属性失败:', error);
            alert(`获取属性失败: ${error.message}`);
        }
    });

    saveButton.addEventListener('click', async () => {
        if (!currentData) return;

        const saveData = {
            id: currentData._id
        };

        if (propFormContent.style.display === 'block') {
            // 收集属性更改
            const propertyInputs = document.querySelectorAll('.property-value');
            const properties = Array.from(propertyInputs).map(input => ({
                edgeId: input.dataset.edgeId === 'new' ? null : input.dataset.edgeId,
                property: input.dataset.property,
                value: input.value,
                isNew: input.dataset.edgeId === 'new'
            }));
            saveData.properties = properties;
        } else if (tagFormContent.style.display === 'block') {
            saveData.tags = Array.from(currentTags);
        } else {
            saveData.labels = {
                zh: {
                    language: "zh",
                    value: document.getElementById('labelZh').value
                }
            };
            saveData.descriptions = {
                zh: {
                    language: "zh",
                    value: document.getElementById('descriptionZh').value
                }
            };
            saveData.aliases = {
                zh: [{
                    language: "zh",
                    value: document.getElementById('aliasZh').value
                }]
            };

            if (!currentData._id) {
                // This is a new knowledge entry
                saveData.type = "327991d8-5d75-46b9-909f-65daa8bf5eb2";
                saveData.tags = Array.from(currentTags);
                saveData.template = "";
                
                try {
                    const response = await fetch('http://localhost:4200/api/knowledge', {
                        method: 'POST',
                        headers: {
                            'Accept': '*/*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(saveData)
                    });

                    if (!response.ok) {
                        throw new Error(`创建失败: ${response.status}`);
                    }

                    // Clear form
                    document.getElementById('labelZh').value = '';
                    document.getElementById('descriptionZh').value = '';
                    document.getElementById('aliasZh').value = '';
                    currentTags.clear();
                    renderTags();

                    // Reset currentData
                    currentData = {
                        _source: {
                            labels: { zh: { value: '' } },
                            descriptions: { zh: { value: '' } },
                            aliases: { zh: [{ value: '' }] },
                            tags: []
                        }
                    };

                    // Show success message and refresh page
                    saveButton.textContent = '创建成功';
                    saveButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                    
                    // 刷新页面
                    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
                    chrome.tabs.reload(tabs[0].id);

                    setTimeout(() => {
                        saveButton.textContent = '保存';
                        saveButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                    }, 1500);

                    return;
                } catch (error) {
                    console.error('创建失败:', error);
                    alert(`创建失败: ${error.message}`);
                    return;
                }
            }
        }

        try {
            const response = await fetch('http://localhost:4200/api/knowledge', {
                method: 'PUT',
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(saveData)
            });

            if (!response.ok) {
                throw new Error(`保存失败: ${response.status}`);
            }

            // 只刷新页面，不关闭弹窗
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            chrome.tabs.reload(tabs[0].id);
            
            // 添加保存成功提示
            saveButton.textContent = '保存成功';
            saveButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            setTimeout(() => {
                saveButton.textContent = '保存';
                saveButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            }, 1500);

        } catch (error) {
            console.error('保存失败:', error);
            alert(`保存失败: ${error.message}`);
        }
    });

    // Initialize file upload section
    document.getElementById('btn-upload-file').addEventListener('click', () => {
        const fileUploadSection = document.getElementById('fileUploadSection');
        
        // Toggle display of file upload section
        if (fileUploadSection.style.display === 'none' || !fileUploadSection.style.display) {
            fileUploadSection.style.display = 'block';
            // Hide edit form when showing file upload
            if (editForm) {
                editForm.style.display = 'none';
            }
            // After showing file upload section, focus the paste area
            setTimeout(() => pasteArea.focus(), 100);
            
            // Initialize file tags input handling
            initializeFileTagEvents();
        } else {
            fileUploadSection.style.display = 'none';
        }
        
        // Add file change event listener
        const fileInput = document.getElementById('fileInput');
        const fileName = document.getElementById('fileName');
        
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileName.textContent = this.files[0].name;
                fileName.style.display = 'block';
            } else {
                fileName.textContent = '未选择文件';
                fileName.style.display = 'none';
            }
        });
        
        // Also handle pasted file
        document.addEventListener('paste', function() {
            if (pastedFile) {
                fileName.textContent = pastedFile.name || '已粘贴图片';
                fileName.style.display = 'block';
            }
        });
    });

    // Store file tags
    let fileTagsList = [];

    // Add tag functionality for file upload section
    function initializeFileTagEvents() {
        const fileTagsInput = document.getElementById('fileTags');
        const fileTagsContainer = document.getElementById('fileTagsContainer');
        
        if (fileTagsInput && fileTagsContainer) {
            // Clear existing event listeners
            fileTagsInput.removeEventListener('keydown', handleFileTagKeydown);
            // Add new event listener
            fileTagsInput.addEventListener('keydown', handleFileTagKeydown);
            
            // Render existing tags if any
            renderFileTags();
        }
    }

    function handleFileTagKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (tag) {
                if (!fileTagsList.includes(tag)) {
                    fileTagsList.push(tag);
                    e.target.value = '';
                    renderFileTags();
                }
            }
        }
    }

    function renderFileTags() {
        const fileTagsContainer = document.getElementById('fileTagsContainer');
        fileTagsContainer.innerHTML = '';
        
        fileTagsList.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove" data-tag="${tag}">×</span>
            `;
            fileTagsContainer.appendChild(tagElement);
        });
        
        // Add click event to remove tags
        fileTagsContainer.querySelectorAll('.remove').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                const tagToRemove = e.target.dataset.tag;
                fileTagsList = fileTagsList.filter(tag => tag !== tagToRemove);
                renderFileTags();
            });
        });
    }

    // Image paste handling
    const pasteArea = document.getElementById('pasteArea');
    const imagePreview = document.getElementById('imagePreview');
    let pastedFile = null;
    
    // Make the entire document listen for paste events
    document.addEventListener('paste', handlePaste);
    
    // Focus on paste area when clicked
    pasteArea.addEventListener('click', () => {
        pasteArea.focus();
    });
    
    function handlePaste(e) {
        // Only process paste events if the file upload section is visible
        if (document.getElementById('fileUploadSection').style.display !== 'block') {
            return;
        }
        
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                // Get the image as a file
                const file = items[i].getAsFile();
                pastedFile = file;
                
                // Show image preview
                const reader = new FileReader();
                reader.onload = function(event) {
                    // Create or reuse image element
                    let img = imagePreview.querySelector('img');
                    if (!img) {
                        img = document.createElement('img');
                        imagePreview.appendChild(img);
                    }
                    
                    img.src = event.target.result;
                    img.style.display = 'block';
                    
                    // Update the paste area text
                    pasteArea.querySelector('p').textContent = '图片已粘贴，点击重新粘贴';
                };
                reader.readAsDataURL(file);
                
                break; // Only process the first image
            }
        }
    }

    // Prevent popup from closing when clicking outside
    document.addEventListener('mousedown', (event) => {
        const popup = document.querySelector('body');
        if (!popup.contains(event.target)) {
            event.preventDefault();
        }
    });

    document.getElementById('uploadFileButton').addEventListener('click', async () => {
        const fileInput = document.getElementById('fileInput');
        const tags = fileTagsList;
        // Use either the file input or the pasted file
        const file = fileInput.files[0] || pastedFile;

        if (!file) {
            alert('请选择一个文件上传或粘贴图片');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('tags', JSON.stringify(tags));

        try {
            const response = await fetch('http://localhost:3000/api/minio-client/uploadFile', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                // Parse response to get the actual filename from the server
                const responseData = await response.json();
                const serverFileName = responseData.name || file.name;
                
                alert('文件上传成功');
                
                // Create a knowledge entry for the uploaded file
                try {
                    const knowledgeData = {
                        labels: {
                            zh: {
                                language: "zh",
                                value: serverFileName // Use server-provided name
                            }
                        },
                        descriptions: {
                            zh: {
                                language: "zh",
                                value: `通过浏览器扩展上传的文件: ${serverFileName}`
                            }
                        },
                        aliases: {
                            zh: [{
                                language: "zh",
                                value: serverFileName
                            }]
                        },
                        tags: tags,
                        type: "327991d8-5d75-46b9-909f-65daa8bf5eb2",
                        template: "",
                        images: [serverFileName] // Add images array with the file name
                    };
                    
                    const knowledgeResponse = await fetch('http://localhost:4200/api/knowledge', {
                        method: 'POST',
                        headers: {
                            'Accept': '*/*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(knowledgeData)
                    });
                    
                    if (knowledgeResponse.ok) {
                        console.log('成功创建文件相关知识条目');
                    } else {
                        console.error('创建知识条目失败:', await knowledgeResponse.text());
                    }
                } catch (knowledgeError) {
                    console.error('创建知识条目时出错:', knowledgeError);
                }
                
                // Reset the form
                fileInput.value = '';
                fileTagsList = [];
                renderFileTags();
                pastedFile = null;
                // Clear the image preview
                const img = imagePreview.querySelector('img');
                if (img) img.style.display = 'none';
                pasteArea.querySelector('p').textContent = '点击此处粘贴图片或截图 (Ctrl+V)';
                
                // Hide file name display when cleared
                document.getElementById('fileName').style.display = 'none';
            } else {
                alert('文件上传失败');
            }
        } catch (error) {
            console.error('上传文件时出错:', error);
            alert('文件上传失败');
        }
    });
});