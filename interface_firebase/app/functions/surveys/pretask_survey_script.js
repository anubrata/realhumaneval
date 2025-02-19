// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAYiGwwAou3hH7k-MgdTVfQp4FvFSLWhUs",
//   authDomain: "codeinterface-85b5e.firebaseapp.com",
//   projectId: "codeinterface-85b5e",
//   storageBucket: "codeinterface-85b5e.appspot.com",
//   messagingSenderId: "637838418708",
//   appId: "1:637838418708:web:9b91375f4df25695885801",
//   measurementId: "G-3XHVCW8K1N",
// };

// firebase.initializeApp(firebaseConfig);
// firebase.analytics();
// const appCheck = firebase.appCheck();
// appCheck.activate(
//   new firebase.appCheck.ReCaptchaEnterpriseProvider(
//     "6LcdzREpAAAAAMjdwSczmJAfGXx_ClJOBs9tJHlV"
//   ),
//   true // Set to true to allow auto-refresh.
// );

var authen_token;
var db = firebase.firestore();
var task_id_rand;
var worker_id_rand = Math.floor(Math.random() * 10000000); // to pass to other pages
var rand_task;
var response_id;
var exp_condition = 0;
var interface_type = "autocomplete";
var name_worker;
var email;

firebase
  .auth()
  .signOut()
  .then(() => {
    console.log("signed out");
  })
  .catch((error) => {
    console.log(error);
  });

let inputs = document.querySelectorAll("input");
let selections = document.querySelectorAll("select");
let buttonSend = document.getElementById("button-send");
let submitButton = document.getElementById("submitButton");

let workerID_input = document.getElementById("workerID");

function isNotEmpty(input) {
  // Check if the input value is empty or not
  if (input.value.length == 0) {
    // If empty, return false and show an error message
    alert("Please fill in this field");
    return false;
  }
  // If not empty, return true
  return true;
}

var form = document.getElementById("form");
form.addEventListener("submit", submit);

function submit(event) {
  event.preventDefault();
  name_worker = document.getElementById("workerID").value;
  email = document.getElementById("emailAddress").value;
  var token_user = document.getElementById("authen_token").value;
  var email_signin = "user@gmail.com";

  firebase
    .auth()
    .signInWithEmailAndPassword(email_signin, token_user)
    .then((userCredential) => {
      // Check if email exists in responses
      db.collection("responses")
        .where("email", "==", email)
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            // Email exists in responses
            let doc = querySnapshot.docs[0];
            let response = doc.data();
            if (response.completed_task === 0) {
              // User has an incomplete task
              task_id_rand = response.task_id;

              assignTask(task_id_rand);
            } else {
              // User has completed their task, assign new task
              assignRandomTask();
            }
          } else {
            // Email does not exist, assign new task
            assignRandomTask();
          }
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    })
    .catch(function (error) {
      var error_answer = document.getElementById("message_highlighted");
      error_answer.innerHTML = "Not signed in or information missing";
      console.log("Error getting documents: ", error);
    });
  return false;
}

function assignRandomTask() {
  db.collection("tasks")
    .where("task_completed", "==", 0)
    .get()
    .then((querySnapshot) => {
      let tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push(doc);
      });

      if (tasks.length > 0) {
        // Select a random task where task_completed is 0
        let randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        var task = randomTask.data();
        task_id_rand = randomTask.id;
        exp_condition = task.exp_condition;
        interface_type = task.interface_type;
        moveToTask();
      } else {
        // No tasks where task_completed is 0, select any random task
        db.collection("tasks")
          .get()
          .then((allTasksSnapshot) => {
            allTasksSnapshot.forEach((doc) => {
              tasks.push(doc);
            });
            let randomTask = tasks[Math.floor(Math.random() * tasks.length)];
            var task = randomTask.data();
            task_id_rand = randomTask.id;
            exp_condition = task.exp_condition;
            interface_type = task.interface_type;
            moveToTask();
          });
      }
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

function assignTask(taskId) {
  // Fetch the task details based on taskId
  db.collection("tasks")
    .doc(taskId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        let task = doc.data();
        task_id_rand = doc.id;
        exp_condition = task.exp_condition;
        interface_type = task.interface_type;
        moveToTask();
      } else {
        console.log("No such document!");
        assignRandomTask();
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

function moveToTask() {
  response_id = task_id_rand.concat("-").concat(worker_id_rand.toString());
  var time_now = new Date();
  var time_now_string = time_now.toString();
  db.collection("responses")
    .doc(response_id)
    .set({
      worker_id: worker_id_rand,
      task_id: task_id_rand,
      name: name_worker,
      email: email,
      date_performed: time_now_string,
      completed_task: 0,
      exp_condition: exp_condition,
    })
    .then(() => {
      console.log("Document successfully written!");
      var myData = [response_id, task_id_rand, exp_condition, worker_id_rand];
      localStorage.setItem("objectToPass", JSON.stringify(myData));

      if (interface_type == "autocomplete") {
        location.href = "./interface_both.html";
      } else if (interface_type == "chat") {
        location.href = "./interface_both.html";
      } else if (interface_type == "both") {
        location.href = "./interface_both.html";
      } else {
        location.href = "./interface_both.html";
      }
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
}

// remove endTime and code from local storage to reset
localStorage.removeItem("endTime");
localStorage.removeItem("code");
localStorage.removeItem("task_index");
