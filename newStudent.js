 /*
 For future classes in case they need to fix or update anything, read this

 The Firebase database uses objects to reference parts of the database
 As such, to set any data you need to create this object. I simply do

 var o={}
 o[uniqueUserId+'part/Im/Trying/To/Access']=value
 ref.update(o)

 Where the part I'm trying to acces would be either the student calendar, their first and last name,
 the period range they are in, or thir year.

 Anytime you want to access the data in the database, you have to do a screenshot of what it has now

 //This lets you see the data once
 userRef.once('value',snapshot=>{
     //First get the values from the snapshot
     var val=snapshot.val()
     //val is an object that has all the values of the database in it. I tend to reference them with 
     // the other syntax of val['partToReference']

     for(var reference in val){
        //reference is the unique reference for each student
        val[reference]//This is the students data
     }

 })
 
 The students array holds a local instance of all the students on the database and updates whenever 
 the database changes. The difference between using the database and the array is that the values
 of the array hold the student's data, and their unique reference to the database

 //This is the format of all objects in the students array
 students[0] === { stu:ThisWouldBeTheStudent, ref:'This is the students reference as a string'}
 
 students[0].stu === { 
     firstName:"Something", 
     lastName:"Something", 
     min:"20",
     hasUpdatedTime:true||false,
     period:"1",
     year:"2",
     calendar:[
         0:{date:DateObject,min:"10"},
         1:{date:DateObject,min:"10"}
     ]
  }
 
 You may want to research destructuring parameters as well as I use that in some parts of the code

 //This is the general layout for destructuring
 function findStusWith({firstName,lastName,min,period}={}){ //You set the object param to an empty
                                                           // object in case you forget to pass in anything
     //The {} in the parameters means you would pass in an object with those properties
 }
 //You would call this as such
 findStuWith({firstName:'Bob',lastName:'Smith'})
 //You can leave out some parameters then and include specific ones. I could skip first and last name too
 findStusWith({min:10})


 
 */



const Time={
    /**Returns the time in minutes from hours and minutes */
    toMin(hour=0,min=0){
        return (parseInt(hour)*60)+parseInt(min)
    },
    /**Returns an object with hour and min holding the times from the minutes passed in*/
    toHours(min=0){
        return {hour:Math.floor(min/60),min:min%60}
    }
}

/**Time needed until they have all time */
const MinutesNeeded=Time.toMin(1500)
/**This is the max amount of extra time they can get */
const MaxExtra=Time.toMin(150)

var ref=firebase.app().database().ref()
/**Allows referencing the users quicker */
var userRef=ref.child('users')

var students=[];

/**Allows case sensitive and case insensitive equlity checking */
function strEqual(s1,s2,isCaseSensitive=false){
    return (isCaseSensitive)?s1===s2:s1.toLowerCase()===s2.toLowerCase()
}
var cal;

/**Used to setup the calendar on the date inputs */
function calOnLoad(){
    cal=new dhtmlXCalendarObject('date')
    cal.hideTime()
    cal.setDateFormat('%l %M %j %Y')
    cal.setPosition('right')
}

/**Takes a date string and uses it to make an object with minutes */
function date(dateString,min,isExtra=false){
    return {date:new Date(dateString).toDateString(),min:min,isExtra:isExtra}
}

/**@returns {Promise} a promise with the student data in it. Use getStu instead because it returns from the student array */
async function getStudent(fn,ln,isCaseSensitive=false){
    return new Promise((resolve,reject)=>{
        ref.once('value',(snapshot)=>{
            var val=snapshot.val()
            for(p1 in val){
                for(p2 in val[p1]){
                    if(strEqual(val[p1][p2].firstName,fn,isCaseSensitive)&&strEqual(val[p1][p2].lastName,ln,isCaseSensitive))
                        resolve(val[p1][p2])
                }
            }
        })
        reject('Student not found')
    })
}

/**Gets a student from the students array */
function getStu(fn='',ln='',isCaseSensitive=false){
    return students.filter(stu=>strEqual(stu.stu.firstName,fn,isCaseSensitive)&&strEqual(stu.stu.lastName,ln,isCaseSensitive))[0]
}

/**Finds student fn,ln and sets their data to properties passed in */
function setStuData(fn,ln,{firstName,lastName,period,year,min}={}){
    var stuAndRef=getStu(fn,ln)
    var updateObj={}
    if(firstName)
        updateObj[stuAndRef.ref+'firstName']=firstName
    if(lastName)
        updateObj[stuAndRef.ref+'lastName']=lastName
    if(period)
        updateObj[stuAndRef.ref+'period']=period
    if(year)
        updateObj[stuAndRef.ref+'year']=year
    if(min)
        updateObj[stuAndRef.ref+'min']=min
    console.log(updateObj)
    ref.update(updateObj)
}

function findStusWith({firstName,lastName,period,minMin,minMax,year}={}){
    return students.filter(stuAndRef=>{
        var stu=stuAndRef.stu
        
        var fn=firstName===undefined||stu.firstName.includes(firstName),
            ln=lastName===undefined||stu.lastName.includes(lastName),
            sMin=parseInt(stu.min),
            minLess=minMin===undefined||sMin>=minMin,
            minMore=minMax===undefined||sMin<=minMax,
            years=year===undefined||parseInt(stu.year)==parseInt(year)
            periods=period===undefined||parseInt(stu.period)==parseInt(period)

        return fn&&ln&&minLess&&minMore&&years&&periods
    })
}

function removeStu(fn,ln,isCaseSensitive){
    console.log('Trying to remove',fn,ln)
    var hasRemoved=false

    userRef.once('value',(snapshot)=>{
        var val=snapshot.val()
        for(p1 in val){
            if(strEqual(val[p1].firstName,fn,isCaseSensitive)&&strEqual(val[p1].lastName,ln,isCaseSensitive)){
                //Confirm pops up a yes or no option which returns true if yes and false if no
                if(confirm('Are you sure you want to remove '+fn+' '+ln+'?')){
                    var updateObj={}
                    updateObj[p1]=null
                    console.log(updateObj)
                    userRef.update(updateObj)
                    hasRemoved=true
                }else{
                    hasRemoved=true
                }
            }
        }
    })
    if(!hasRemoved)
        alert('Could not find student '+fn+' '+ln)
}

function removeByRef(reference){
    //If you pass in stu and ref
    ref.child(reference).remove((error)=>console.log(error))

}

var addingId=1
function addToTable(stu){
    
    var row=document.createElement('tr')

    function addToRow(s){
        var ele=document.createElement('td')
        ele.innerHTML=s
        row.appendChild(ele)
        return ele;
    }
    
    function addToRowInput(){
        var td = document.createElement('td');
        td.classList.add('all')
        var y=document.createElement("div")
        y.classList.add("dateAndTime")
        td.appendChild(y)
        function appendToY(...eles){
            eles.forEach(ele=>y.appendChild(ele));
        }
        function e(elementType,id,type,...classes){
            var ele=document.createElement(elementType)
            ele.id=id;
            classes.forEach(clas=>ele.classList.add(clas));
            if(elementType==='input'){
                ele.setAttribute('type',type);
                if(type==='number')
                    ele.setAttribute('value','0');
            }
            return ele;
        }
        var dateE = e('input',"addingTimeDate"+addingId,'text',"addingTimeDate");
        var hrs = e('input',"addingHrs"+addingId,'number',"addingTime");
        var min = e('input',"addingMin"+addingId,'number',"addingTime");
        var but = e("button","SubmitHrs"+addingId,undefined,"SubmitHrs");
        var back = e('div',undefined,undefined,'back');

        //Since you didn't want to create them I did lol. You get to add the classes and all that but I did what I wanted to do.
        var pTag1 = e('p',undefined,undefined,'addingTime');
        var pTag2 = e('p',undefined,undefined,'addingTime');
        pTag1.innerHTML='Hours'
        pTag2.innerHTML='Minutes'
        pTag1.appendChild(hrs)
        pTag2.appendChild(min)

        var br = document.createElement("br");

        addingId++
        but.innerHTML = "Submit";
        but.onclick=function(){
            /**@type {String} */
            var id=Number(this.id.replace('SubmitHrs',''))
            console.log(id)
            //var table=getTableNum(id.replace('SubmitHrs',''))
            var student=students[id-1]
            //console.log(student,id)

            var d=document.getElementById('addingTimeDate'+id),
                h=document.getElementById('addingHrs'+id),
                m=document.getElementById('addingMin'+id)
            var nDate=new Date(d.value).toDateString()

            var dat=date(nDate,Time.toMin(Number(h.value),Number(m.value)))
            if(dat.date!=='Invalid Date'&&dat.min!==0){
                addDateToStu(student,dat)
            }
            tallyStudentHours()
            updateAll()
            //////////////////////////////////window.scrollTo('SubmitHrs'+id)
            
        };
        back.appendChild(but)
        appendToY(dateE,pTag1,pTag2)
        row.appendChild(td);
        td.appendChild(back)
        cal.attachObj(dateE);
        dateE.onfocus=function(){if(cal.isVisible())cal.show(date.id)}
        dateE.onblur=function(){if(!cal.isVisible())cal.hide()}
        dateE.value=new Date().toDateString()
    }
    var table=document.getElementById('stuView')
    
    addToRow(stu.lastName+", "+stu.firstName)//.classList.add('dropDownContent')
    var t=Time.toHours(stu.min)

    function parsePeriod(prd){
        if(prd==1)
            return '1-4'
        else if(prd==2)
            return '5-7'
        else return 'Unknown periods'
    }
    function parseYear(year=0){
        if(year==1)
            return '1st'
        else if(year==2)
            return '2nd'
        //Just in case for debugging
        else if(year==3)
            return '3rd'
        else
            return year+'th'
    }
    function getTime(){
        var minNeed=Time.toHours(MinutesNeeded-stu.min)
        var str=t.hour+' hours, '+t.min+' minutes <br> <div>To go: '+minNeed.hour+':'
        if(minNeed.min.toString().length===1)
            str+='0'+minNeed.min
        else
            str+=minNeed.min

        str+='</div>'
        return str
    }
    /////////////////////////////////////////////////////////Maybe swap positions
    addToRow(parseYear(stu.year))
    addToRow(parsePeriod(stu.period))
    addToRow(getTime()).classList.add('dropDown')
    addToRowInput();

    table.appendChild(row)
}

var filters={}

function filterChangePeriod(){
    var val=document.getElementById('periodFilter').value;
    if(val!=='all')
        filters.period=val    
    else
        delete filters.period
    
    //showStudentsInTable(findStusWith(filters))
    clearTable()
    studentInit()
}
function filterChangeYear(){
    var val=document.getElementById('yearFilter').value;
    if(val!=='all')
        filters.year=val    
    else
        delete filters.year

    //showStudentsInTable(findStusWith(filters))
    clearTable()
    studentInit()
}

function getTableNum(n){
    var table=document.getElementById('listView').children[1]
    return table.children[n]
}

function sortStus(){
    var stus=findStusWith(filters)

    //return stus.sort(byName)

    var y1=stus.filter(stu=>stu.stu.year==1),
        y2=stus.filter(stu=>stu.stu.year==2)

    return y1.sort(byName).concat(y2.sort(byName))

    function byName(a,b){   
        
        a=a.stu
        b=b.stu

        var ret=Number(a.year)-Number(b.year)

        if(a.lastName>b.lastName)
            return 1//+ret;
        else if(a.lastName<b.lastName)
            return -1//+ret

        if(a.firstName<b.firstName)
            return -1//+ret;
        else if(a.firstName>b.firstName)
            return 1//+ret;
        else 
            return 0//+ret
    }
}

/**Goes through every student and tallies up their calendar's minutes to update the running total minutes */
function tallyStudentHours(){
    /////////////////////////////////Fix joining of same day minutes
    students.forEach(stuAndRef=>{
        var stu=stuAndRef.stu
        if(stu.hasUpdatedTime){
            console.log('tallied ',stu.firstName,stu.lastName)
            var min=0
            //Joins together dates of the same day
            /**@type {{min,date}[]} */
            var c=stu.calendar
            for(let i=0;i<c.length;i++){
                for(let j=0;j<c.length;j++){
                    if(i!==j&&c[i].date===c[j].date){
                        var m=Number(c[i].min)+Number(c[j].min)
                        c.splice(j--,1)
                        i
                        c[i].min=m///////////////////////////////////////////////////////////////////////////////// 
                    }
                }
            }
            for(let i=0;i<c.length;i++)
                if(Number(c[i].min)===0)
                    c.splice(i--,1)
            stu.calendar.forEach(dateAndMin=>{
                min+=parseInt(dateAndMin.min)
            })
            var o={}
            o[stuAndRef.ref+'calendar']=c
            o[stuAndRef.ref+'min']=min
            o[stuAndRef.ref+'hasUpdatedTime']=false
            ref.update(o)
        }
    })
}

/**Adds all students from the database to the local students array */
function studentInit(){
    openLoadTab()
    students=[]
    addingId=1
    ref.once('value',(snapshot)=>{
        var val=snapshot.val();
        for(p1 in val){
            for(p2 in val[p1]){
                //Adds all the students to the table
                students.push({ref:p1+'/'+p2+'/',stu:val[p1][p2]})
            }
        }
    }).then(()=>{
        sortStus().forEach(stu=>addToTable(stu.stu))
        openTab1()
    })
}

async function showStudentsInTable(arr){
    openLoadTab()
    new Promise(()=>{
        
        clearTable()
        addingId=0
        //console.log(arr)
        if(arr.length===0)
            return
        //console.log(arr)
        if(arr[0].stu){
            arr.map(ele=>ele.stu).forEach(stu=>{
                addToTable(stu)
            })
        }else{
            arr.forEach(stu=>{
                addToTable(stu)
            })
        }
    }).then(openTab1())
}

/**Just a debugging function to confirm access to the database */
function listStudentsInConsole(){
    userRef.orderByChild('lastName').once('value',function(snapshot){
        var val = snapshot.val();
        for(part in val)
            console.log(val[part])
    },(errorObject)=>{
        console.log('Read Failed: '+errorObject.code)
    })
}

/**
 * @description Adds a new student to the students array. Called from the HTML
 * @param {string} firstName The student's first name
 * @param {string} lastName The student's last name
 * @param {number} curHours The current ammount of hours the student has
 * @param {number} curMins The current ammount of minutes out of an hour the student has
 * @param {1|2} classPeriod The 1st period that the student has the class
 * @param {1|2} year The year the student is enrolled in. 1 || 2
 */
async function addStudent(firstName,lastName,classPeriod,year,curHours=0,curMins=0){
    var hasData=(firstName!==undefined&&firstName!==''&&lastName!==undefined&&lastName!==''&&classPeriod!==undefined&&year!==undefined),
        dataGood=(/^[1-2]{1}$/.test(classPeriod)&&/[1-2]{1}$/.test(year)&&parseInt(classPeriod)===parseFloat(classPeriod)&&parseInt(year)===parseFloat(year))
    if(hasData&&dataGood){
        var stu={
            firstName:firstName,
            lastName:lastName,
            year:year,
            /**This is the total minutes the student has. Gets converted to hours and min */
            min:Time.toMin(curHours,curMins),
            /**This will hold all the dates along with the time for that date. Adding to them will be with the date() func */
            calendar:[today(Time.toMin(curHours,curMins))],
            period:classPeriod,
            hasUpdatedTime:false
        }
        userRef.push(stu)

        addCompletedWindow(firstName,lastName);
        addToTable(stu)
        return true;
    }else{
        if(!hasData)
            alert("Please enter all the requested data");
        else
            alert("Make sure all inputs are within range")
        return false;
    }
}

function addRefsToStus(){
    userRef.once('value',(snapshot)=>{
        var val=snapshot.val()
        var o={}
        for(ref in val){
            if(val[ref].ref===undefined){
                o[ref+'/ref']="users/"+ref
            }
        }
        if(Object.keys(o).length!==0)
            userRef.update(o)
    })
}

//Adds a data and minutes to the student with fn, ln
function addDateToStudent(fn,ln,dateAndMin){
    var stuAndRef=getStu(fn,ln)
    if(stuAndRef){
        var cal=stuAndRef.stu.calendar
        cal.push(dateAndMin)
        var o={}
        o[stuAndRef.ref+'calendar/']=cal
        ref.update(o)
    }else{
        console.log(0)
    }
}

/**Uses the actual student object to update the date */
function addDateToStu(stuAndRef,dateAndMin){
    var o={}
    var cal=stuAndRef.stu.calendar
    cal.push(dateAndMin)
    o[stuAndRef.ref+'calendar/']=cal
    o[stuAndRef.ref+'hasUpdatedTime']=true
    ref.update(o)
    stuAndRef.stu.hasUpdatedTime=true
    console.log(stuAndRef.stu)
}

function today(min){
    return date(new Date().toDateString(),min)
}

var completedWindowTimeout=0,newWindow=false;
const completedWindowTimeoutMax=100;

/**Adds a window showing the name of the student that was last added */
function addCompletedWindow(first,last){
    var ele=document.getElementById('addedStudent')
    ele.innerHTML=first+' '+last+' was added successfully'
    ele.style.visibility='visible'
    newWindow=true
}

function eleInit(){
    document.getElementById('newStudent').style.visibility='hidden';
    document.getElementById('RemoveStu').style.visibility='visible'
}

/**Opens and closes the new student window */
function toggleNewStudentWindow(){
    var newStu=document.getElementById('newStudent')
    var stuBtn=document.getElementById('studentBtn')
    switch(newStu.style.visibility){
        case 'visible':
            newStu.style.visibility='hidden'
            stuBtn.style.visibility='visible'
            break
        case 'hidden':
            newStu.style.visibility='visible'
            stuBtn.style.visibility='hidden'            
            break
    }
}

/**Opens and closes the remove student window */
function toggleRemoveStudentWindow(){
    var btn=document.getElementById('RemoveStu')
    var window=document.getElementById('RemoveMenu')
    switch(btn.style.visibility){
        case 'visible':
            btn.style.visibility='hidden'
            window.style.visibility='visible'
            break
        case 'hidden':
            btn.style.visibility='visible'
            window.style.visibility='hidden'

    }
}

/**Removes the new student window after a time */
var completedTimeout=setInterval(()=>{
    if(newWindow&&completedWindowTimeout<completedWindowTimeoutMax)
        completedWindowTimeout++
    else{
        completedWindowTimeout=0
        newWindow=false;
        document.getElementById('addedStudent').style.visibility='hidden'
    }
},60)

/**Gets rid of all elements in the table aside from the header */
function clearTable(){
    var div=document.getElementById('listView')
    var table=div.querySelector('table')
    var rows=table.querySelectorAll('tr')
    for(let i=1;i<rows.length;i++){
        table.removeChild(rows[i])
    }
}

//These update the table on any value changing in the database
//ref.on('child_added',updateAll)
//ref.on('child_removed',updateAll)
//ref.on('child_changed',updateAll)
//ref.on('child_moved',updateAll)

/**I keep this here in case I need to update more than just the table when the database changes */
function updateAll(){
    updateTable()
}

function updateTable(){
    clearTable()
    studentInit()
}

var overrideAskRemove=false

/**Removes all students that are year 2 and moves all year 1 students to 2 */
function removeYear2(){
    if(confirm('Are you sure you want to remove all year 2 students?')&&confirm('Are you really sure?')){
        overrideAskRemove=true
        students.filter(stu=>stu.stu.year>=2).forEach(stu=>{
            removeStu(stu.stu.firstName,stu.stu.lastName)
        })
        students.forEach(stuAndRef=>{
            var o={}
            o[stuAndRef.ref+'year']=parseInt(stuAndRef.stu.year)+1
            ref.update(o)
        })
        overrideAskRemove=false
    }
}

/**Just for testing because I can't be bothered to keep adding a ton of random students manually */
function sampleStudents(n=1){
    var fns=['Joe','Hannah','Gary','Sue','John','Jenny','Bob','Tim','Mary','Neo','Devin','Linda','Brenda','Paula','Marie','Lucy',
            'Alice','Shane','Sam','Anne','Aliyah','Jean','Ellen','Max','Alan','Erik','Charles','Omar','Robbie','Oliver','Jimmy']
    var lns=['Smith','Johnson','Holtsclaw','Phelps','Brito','Mayorga','Smith','Law','Jones','Davis','Miller','Brown','Williams',
            'Hill','Lopez','Young','Allen','Morris','Price','Long','Nelson','Jackson','White','Phillips','Clark','Lee','Lewis']

    var yrs=[1,2],
        pds=[1,2]
    function rnd(arr){
        return arr[parseInt(Math.random()*arr.length)]
    }
    var i=0;
    var func=function(){
        //////////////////////////////////////////////////////////////////////////
        var fn=rnd(fns),ln=rnd(lns)
        while(students.some(stu=>stu.stu.firstName===fn)&&students.some(stu=>stu.stu.lastName===ln)){
            fn=rnd(fns)
            ln=rnd(lns)
            console.log(fn,ln)
        }
        addStudent(fn,ln,rnd(pds),rnd(yrs))
        if(++i<n)
            setTimeout(func,75)
    }
    setTimeout(func,75)
}

function addRangedTimeToStus(rnd=500){
    students.forEach(stuAndRef=>{
        var stu=stuAndRef.stu
        addDateToStudent(stu.firstName,stu.lastName,today(parseInt(Math.random()*rnd)))
    })  
}

function submit(){
    document.body.style.backgroundColor = 'black';
}

var o
userRef.on('value',function(snap){
    o=snap.val()
})

function clearAllStudents(){
    if(confirm("Are you sure you want to delete all students?")&&confirm("This is irreversable and cannot be recovered after."+
    " Are you really sure?")){
        userRef.remove()
        clearTable()
        studentInit()
    }
}