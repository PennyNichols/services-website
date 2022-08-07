let DB;

let form = document.querySelector('form');
let firstname = document.querySelector('#first-name');
let lastname = document.querySelector('#last-name');
let phone = document.querySelector('#phone');
let email = document.querySelector('#email');
let date = document.querySelector('#date');
let time = document.querySelector('#time');
let options = document.querySelector('#options');
let message = document.querySelector('#message');
let services = document.querySelector('#services');

document.addEventListener('DOMContentLoaded', () => {
     // create the database
     let ScheduleDB = window.indexedDB.open('appointments', 1);

     // if there's an error
     ScheduleDB.onerror = function() {
          console.log('error');
     }
     // if everything is fine, assign the result is to the (letDB) instance 
     ScheduleDB.onsuccess = function() {
          // console.log('Database Ready');

          
          DB = ScheduleDB.result;

          showAppointments();
     }

   
     ScheduleDB.onupgradeneeded = function(e) {
          
          let db = e.target.result;
          
          let objectStore = db.createObjectStore('appointments', { keyPath: 'key', autoIncrement: true } );

        
          objectStore.createIndex('firstname', 'firstname', { unique: false } );
          objectStore.createIndex('lastname', 'lastname', { unique: false } );
          objectStore.createIndex('phone', 'phone', { unique: false } );
          objectStore.createIndex('email', 'email', { unique: false } );
          objectStore.createIndex('date', 'date', { unique: false } );
          objectStore.createIndex('time', 'time', { unique: false } );
          objectStore.createIndex('options', 'options', { unique: false } );
          objectStore.createIndex('message', 'message', { unique: false } );

          //console.log('Database ready and fields created!');
     }

     form.addEventListener('submit', addAppointments);

     function addAppointments(e) {
          e.preventDefault();
          let newAppointment = {
               firstname : firstname.value,
               lastname : lastname.value,
               phone : phone.value,
               email : email.value,
               date : date.value,
               time : time.value,
               options : options.value,
               message : message.value
          }
          
          let transaction = DB.transaction(['appointments'], 'readwrite');
          let objectStore = transaction.objectStore('appointments');

          let request = objectStore.add(newAppointment);
                request.onsuccess = () => {
               form.reset();
          }
          transaction.oncomplete = () => {
               //console.log('New schedule added');

               showAppointments();
          }
          transaction.onerror = () => {
              //console.log();
          }

     }
     function showAppointments() {
       
          while(appointments.firstChild) {
            appointments.removeChild(appointments.firstChild);
          }
         
          let objectStore = DB.transaction('appointments').objectStore('appointments');

          objectStore.openCursor().onsuccess = function(e) {
               
               let cursor = e.target.result;
               if(cursor) {
                    let appointmentHTML = document.createElement('li');
                    appointmentHTML.setAttribute('data-appointment-id', cursor.value.key);
                    appointmentHTML.classList.add('list-group-item');
                    
                 
                    appointmentHTML.innerHTML = `  
                         <p class="font-weight-bold">First Name:  <span class="font-weight-normal">${cursor.value.firstname}<span></p>
                         <p class="font-weight-bold">Last Name:  <span class="font-weight-normal">${cursor.value.lastname}<span></p>
                          <p class="font-weight-bold">Phone Number:  <span class="font-weight-normal">${cursor.value.phone}<span></p>
                          <p class="font-weight-bold">Email Address:  <span class="font-weight-normal">${cursor.value.email}<span></p>
                         <p class="font-weight-bold">Date:  <span class="font-weight-normal">${cursor.value.date}<span></p>
                         <p class="font-weight-bold">Time:  <span class="font-weight-normal">${cursor.value.time}<span></p>
                         <p class="font-weight-bold">Service(s):  <span class="font-weight-normal">${cursor.value.options}<span></p>
                         <p class="font-weight-bold">Message:  <span class="font-weight-normal">${cursor.value.message}<span></p>
                    `;

                    
                    const cancelBtn = document.createElement('button');
                    cancelBtn.classList.add('btn', 'btn-danger');
                    cancelBtn.innerHTML = 'Cancel';
                    cancelBtn.onclick = removeAppointment;
               
                 
                    appointmentHTML.appendChild(cancelBtn);
                    appointments.appendChild(appointmentHTML);

                    cursor.continue();
               } else {
                    if(!appointments.firstChild) {
                        services.textContent = 'Change your visiting hours';
                         let noSchedule = document.createElement('p');
                         noSchedule.classList.add('text-center');
                         noSchedule.textContent = 'No results Found';
                        appointments.appendChild(noSchedule);
                    } else {
                        services.textContent = 'Cancel Your Appointments'
                    }
               }
          }
     }

          function removeAppointment(e) {
       
          let scheduleID = Number( e.target.parentElement.getAttribute('data-appointment-id') );
         
          let transaction = DB.transaction(['appointments'], 'readwrite');
          let objectStore = transaction.objectStore('appointments');
         
          objectStore.delete(scheduleID);

          transaction.oncomplete = ()=>{
             
               e.target.parentElement.parentElement.removeChild( e.target.parentElement );

               if(!appointments.firstChild) {
                   
                    services.textContent = 'Change your visiting hours';
                   
                   let noSchedule = document.createElement('p');
                  
                   noSchedule.classList.add('text-center');
                   
                   noSchedule.textContent = 'No results Found';
                
                    appointments.appendChild(noSchedule);
               } else {
                   services.textContent = 'Cancel your Appointment'
               }
          }
     }

});