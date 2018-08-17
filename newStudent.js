var students=[];

function addPerson(firstName,lastName,curHours,curMins,classPeriod,year){
    if(firstName&&lastName&&curHours&&curMins&&classPeriod&&year){
        var cur={
            name:{
                first:firstName,
                last:lastName
            },
            time:{
                year:year,
                hours:curHours,
                min:curMins
            },
            class:classPeriod,
        }
        students.push(cur);
        students.sort(function(a,b){
            var tempA=a.name.last.toUpperCase();
            var tempB=b.name.last.toUpperCase();
            return(tempA<tempB)?-1:(tempA>tempB)?1:0;
        });
    }
}

