var localDB = {};
var poller;

function ready() {
  getCSV();
  setRandomId();
  document.getElementById('gform')
}
function setRandomId() {
  document.getElementById('taskid').value = Math.round(10000 * Math.random());
  document.getElementById("newtodo").value = "";
  document.getElementById("taskstatus").value = "pending";
}

function getCSV() {
  axios.get("https://docs.google.com/spreadsheets/d/1RsUcvjN344LS2CHwOyQyKBQMzOuSc_5YO3V3o8d1xhc/pub?gid=2060560014&single=true&output=csv")
    .then(function(response) {
      resetPoller();
      formatLocalDB(response.data);
    })
}

function formatLocalDB(data) {
  var tempDB = data.split("\n");
  if (tempDB[0].includes("Marca temporal") ||
      tempDB[0].includes("task") ||
      tempDB[0].includes("status")) {
    tempDB.shift();
  }
  tempDB.forEach(function(element, index) {
    var currentList = element.split(",");
    var id = "n" + currentList[3];
    localDB[id] = {
      task: currentList[1],
      currentStatus: currentList[2]
    }
  });
  refreshView();
}

function refreshView() {
  var todolist = document.getElementById('todolist');
  setRandomId();
  while (todolist.firstChild) {
    todolist.removeChild(todolist.firstChild);
  }
  Object.keys(localDB).forEach(function(id) {
    var div = document.createElement("div");
    var currentStatus = localDB[id].currentStatus.trim();
    var taskid = "task-" + id.trim();
    currentClass  = (currentStatus == "done") ? "crossed" : "";

    div.setAttribute("class", currentClass);
    div.innerHTML = localDB[id].task;
    div.setAttribute('status', currentStatus);
    div.setAttribute('id', taskid);
    div.setAttribute('onclick', "handleToggle('"+taskid+"')");
    todolist.appendChild(div);
  });
}

function handleToggle(taskid) {
  var task = document.getElementById(taskid);
  var entry_task = task.textContent;
  var entry_id   = task.id.replace(/task-/g,'');
  var entry_status = task.getAttribute("status");
  var new_entry_status = (entry_status === "pending") ? "done" : "pending";

  document.getElementById("newtodo").value = entry_task;
  document.getElementById("taskstatus").value = new_entry_status;
  document.getElementById("taskid").value = entry_id;
  document.getElementById('gform').submit();

  localDB[entry_id] = {
    task: entry_task,
    currentStatus: new_entry_status
  };
  refreshView();
  resetPoller();
}

function handleSubmit() {
  var newtodo = document.getElementById("newtodo").value;
  var id = document.getElementById("taskid").value;
  var status = document.getElementById("taskstatus").value;
  localDB[id] = {
    task: newtodo,
    currentStatus: status
  };
  setTimeout(function() {
    refreshView();
    resetPoller();
  }, 200);
  return true;
}

function resetPoller() {
  clearTimeout(poller);
  poller = setTimeout(function() {
    getCSV();
    console.log('hello world');
  }, 300000);
}
