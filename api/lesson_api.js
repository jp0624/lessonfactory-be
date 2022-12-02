let express = require('express');
var lesson = require('../models/lesson');

let app = express();

let response;

let lesson_query = require('../models/lesson');

let variation_groups = [];

function consoleLog(title, msg, line) {
    if(!line){
        line = 0;
    }
    console.log('[' + line + '] ', title, msg);
}

app.get('/ismetric/:country_code', function (req, res) {

    country_code = req.params.country_code;

    lesson_query.isCountryMetric(req.params, (cm_err, cm_rows) => {
        if (cm_err) {
            consoleLog('Error: ', cm_err);

        } else {

            let hasrows = (cm_rows.length > 0);
            res.json(hasrows);
        }
    });

});
app.get('/isimperial/:country_code', function (req, res) {

    country_code = req.params.country_code;

    lesson_query.isCountryImperial(req.params, (cm_err, cm_rows) => {
        if (cm_err) {
            consoleLog('Error: ', cm_err);

        } else {

            let hasrows = (cm_rows.length > 0);
            res.json(hasrows);
        }
    });

});

app.get('/lang_dir/:lang_code', function (req, res) {

    lang_code = req.params.lang_code;

    lesson_query.langDirection(req.params, (err, rows) => {
        if (err) {
            consoleLog('Error: ', err);

        } else {
            res.json(rows[0].text_dir);

        }
    });
});

//Get course code
app.get('/getcourse/:lesson_code/:vehicle_type', function (req, res) {
  lesson_query.getCourseInfo(req.params, (err, rows) => {
        if (err) {
            consoleLog('Error: ', err);

        } else {
            res.json(rows[0]);
        }
    });
});
// API Creation Code Start
app.get('/lesson-v2/:countrycode/:langcode/:lessoncode/:deviceId/:vehiclecode/:versioncode',
	function (req, res) {
        console.log('BLAH')
		console.log(req.params);
		lesson.exporttojson(req.params, function (err, data, fields) {
			if (err) {
				console.log(err);
				res.status(500).send(err);
			}
			else {
				let lessonInfo = {
					lesson: data[3],
					tasks: data[5],
					content: data[6],
					dictionary: data[7]
				};
				let op = processJsonLessonInformation(lessonInfo.lesson, lessonInfo.tasks, lessonInfo.content, lessonInfo.dictionary);
				let versioncode = req.params.versioncode;
				if(versioncode !== 'null'){
					op = processSubVersioning(op, versioncode);
                }
                //JSON api call
                console.log(JSON.stringify(op));
        res.json(op);
			}
		});
	}
);
function processJsonLessonInformation(lesson, tasksinfo, content, dictionary) {
	let finalOutput = {};

	finalOutput.lesson_id = lesson[0].lesson_id;
	finalOutput.lesson_code = lesson[0].lesson_code;
	finalOutput.lesson_name = lesson[0].lesson_name;
	finalOutput.course_name = lesson[0].course_name;
	finalOutput.course_code = lesson[0].course_code;
	finalOutput.vehicle_code = lesson[0].vehicle_code;	
	finalOutput.type_id = lesson[0].type_id;
	finalOutput.lesson_type = lesson[0].lesson_type;
	finalOutput.is_imperial = lesson[0].is_imperial;
	finalOutput.is_metric = lesson[0].is_metric;
	finalOutput.lang_dir = lesson[0].lang_dir;
	finalOutput.country_code = lesson[0].country_code;
	finalOutput.lang_code = lesson[0].lang_code;
	finalOutput.device_code = lesson[0].device_code;
	finalOutput.version_code = lesson[0].version_code;
	finalOutput.tasks = tasksinfo;

	finalOutput.tasks.forEach((task) => {
		console.log(task);
		task.dictionary = [];
		let taskdictionary = dictionary.filter((dic) => {
			return dic.task_id == task.task_id;
		})
		if (taskdictionary && taskdictionary.length && taskdictionary.length > 0) {
			processdictionary(task, taskdictionary);
		}

		processContent(task, content, taskdictionary);
	})
	return finalOutput;
};

function processdictionary(task, taskdictionary) {
	taskdictionary.forEach((dicitem) => {
		task.dictionary.push(
			{
				term: dicitem.term,
				selector: dicitem.selector,
				value: dicitem.value
			}
		);
	});
}

function processContent(task, content1, dictionaryterms) {
	console.log(content1);

	let taskContents = content1.filter(function (cont) {
		return cont.task_id == task.task_id;
	});

	var removeItems = [];
	// task.content = taskContents;
	let attrId = 0;
	let taskgrpid = 0;
	taskContents.forEach((cont, ind) => {
		console.log(cont, ind);

		if (attrId == cont.attr_id && taskgrpid == cont.task_group_id) {
			removeItems.push(ind - 1);
		}

		attrId = cont.attr_id;
		taskgrpid = cont.task_group_id;
	});
	//Remove the low proprity duplicate content
	if (removeItems.length > 0) {
		removeItems.reverse();
		removeItems.forEach((ind) => {
			taskContents.splice(ind, 1);
		});
	};

	//clone and sort the content
	let contentCopy = taskContents.slice();
	let op = [];
	let tg_id = 0;
	let firstTime = true;
	let groupName = '';
	let obj1 = {};
    let obj2 = {};
    
	contentCopy.forEach((data, ind) => {
		if ((data.task_group_id != tg_id ) && tg_id != 0) {
			firstTime = true;
			op.push(obj2);
		};

		if (firstTime) {
			obj2 = Object.assign({}, obj1);
        }
        
		groupName = data.group;

		if (firstTime && groupName) {
			obj2[groupName] = {};
			obj2[groupName][data.type] = data.value;
		} else if (groupName) {
			if (!obj2[groupName]) {
				obj2[groupName] = {};
				obj2[groupName][data.type] = data.value;
			} else {
				obj2[groupName][data.type] = data.value;
			}
			
		}

		tg_id = data.task_group_id;
		firstTime = false;
	});

	if ( obj2 )
		op.push(obj2);
	task.content = op;
	console.log(removeItems);
};

function processSubVersioning(op, versioncode){
        var contentVideoIndex = findIndexInData(op.tasks, 'name', 'Video');
        if(versioncode.toLowerCase() === 'es'){
            var essential = groupByEssential('essential', op.tasks[contentVideoIndex].content);
            op = cleanEssential(op, contentVideoIndex, 'essential');
            var questions = groupByQuestion(op.tasks);
            op.tasks[contentVideoIndex].content.push({'essential' : essential , 'questions' : questions});
            op = cleanQuestions(op);
        }else{
            var questions = groupByQuestion(op.tasks);
            op.tasks[contentVideoIndex].content[1]['questions'] = questions;
            op = cleanQuestions(op);
        }
        return op;
}

function findIndexInData(data, property, value) {
	for(var i = 0, l = data.length ; i < l ; i++) {	
	  if(data[i][property] === value) {
		return i;
	  }
	}
	return -1;
  }

  function groupByEssential(key, array) {
	var result = [];
	for (var i = 0; i < array.length; i++) {
		if(array[i][key] != null){
			result.push(array[i][key]);
		}
	}
	return result;
  }

  function groupByQuestion(array){
	var result = [];
	for (var i = 0; i < array.length; i++) {
		if(array[i].name.match('Question') != null){
			result.push(array[i]);
		}
	}
	return result;
 }

 function cleanEssential(op, index, key){
	for (var i = 0; i < op.tasks[index].content.length; i++) {
		if(op.tasks[index].content[i][key] != null){
			op.tasks[index].content.splice(i, 1);
			cleanEssential(op, index, key);
		}
	}
	return op;
 }

 
 function cleanQuestions(op){
	for (var i = 0; i < op.tasks.length; i++) {
		if(op.tasks[i].name.match('Question') != null){
			op.tasks.splice(i, 1);
			cleanQuestions(op);
		}
	}
	return op;
 };

//API Creation Code End

              
             
app.get('/lesson/:lesson_code/:country_code?/:lang_code?/:device?', function (req, res) {

    // REQUIRED PARAMS
    // ===============
    // lesson_code

    // OPTIONAL PARAMS
    // ===============
    // country_code
    // lang_code

    consoleLog('req.params: ', req.params, 46);

    response = res;
    let params = Object.assign({}, req.params);

    getCountryProperties(params);

});

function getCountryProperties(params) {
    // REQUIRED PARAMS
    // ===============
    // lesson_code

    lesson_query.getCountryProps(params, (cv_err, cv_rows) => {

        if(cv_err) {

            //consoleLog('Error: ', cv_err);

        } else {

            params.country_versions = cv_rows;
            // consoleLog('Country Properties: ', cv_rows, 79);

            let desktop = {
                name: 'desktop',
                property_id: 1
            };
            params.country_versions.push(desktop);

            if (+params.device === 2) {
                let mobile = {
                    name: 'mobile',
                    property_id: 2,
                    category_id: 2
                };
                params.country_versions.push(mobile);
            }

            getVariationGroups(params);
        }
    });

}

function getVariationGroups(params) {

    let vgVersionIds = [];

    lesson_query.getVariationGroups(params, (cv_err, vg_rows) => {

        if(cv_err) {

            consoleLog('Error: ', cv_err, 101);

        } else {

            let variation_grps = vg_rows;
            let variation_groups = [];

            // consoleLog('Variation Groups loaded');
            // consoleLog('Variation Groups: ', vg_rows, 108);

            let pendingVariationGroups = variation_grps.length;

            if (variation_grps.length > 0) {

                //setup some working arrays:

                for (let g_idx in variation_grps) {
                    //consoleLog('Variation Group: ', variation_grps[g_idx], 118);

                    let verid = variation_grps[g_idx].version_id;
                    vgVersionIds.push(verid);

                }
                
                lesson_query.getVariationGroupProps(vgVersionIds, (vgp_err, vgp_rows) => {

                    if(vgp_err) {

                        //consoleLog('Error: ', vgp_err);

                    } else {                        

                        for (let vg_idx in variation_grps) {
                            //consoleLog('VARIATION GROUP: ', variation_grps[vg_idx], 133);

                            //variation_grps[vg_idx].priority = 0;
                            let verid = variation_grps[vg_idx].version_id;
                            variation_grps[vg_idx].props = vgp_rows.filter(row => row.version_id === verid);

                            let properties = variation_grps[vg_idx].props;
                            let propertiesFound = 0;

                            propertyLoop: for (let prop_idx in properties) {

                                variation_grps[vg_idx].priority += +properties[prop_idx].priority;
                                //consoleLog('+++++++++++++++++++++++ priority: ', properties[prop_idx]);

                                let property = properties[prop_idx];

                                countryLoop: for (let ver_idx in params.country_versions) {

                                    if(property.property_id == params.country_versions[ver_idx].property_id){
                                        propertiesFound++;
                                        break countryLoop;
                                    };

                                }

                            }

                            if (properties.length === propertiesFound) {
                                variation_groups.push(variation_grps[vg_idx]);
                            }

                        }

                        function compare(a,b) {
                            if (a.priority < b.priority) return 1;
                            if (a.priority > b.priority) return -1;
                            return 0;
                        }
                        
                        variation_groups.sort(compare);

                        params.variation_groups = variation_groups;
                        //consoleLog('Success!: ', variation_groups, 175)
                        getLesson(params);

                    }
                });

            } else {

                if (0 === --pendingVariationGroups || 0 === pendingVariationGroups) {
                    // getLesson(params);
                }

            }
        }
    });
}

function getLesson(params) {

    lesson_query.getLessonData(params.lesson_code, (l_err, l_rows) => {

        if(l_err) {

            consoleLog('Error: ', l_err);

        } else {

            let lesson = l_rows[0];
            params.lesson = lesson;
            getTasks(params);

        }
    });
}

function getTasks(params) {

    // REQUIRED PARAMS
    // ===============
    // lesson_id

    let lesson = params.lesson;

    params.lesson.tasks = [];
    let lesson_id = lesson.lesson_id;

    lesson_query.getLessonTasks(lesson_id, (lt_err, lt_rows) => {

        if(lt_err) {

            consoleLog('Error: ', lt_err);

        } else {

            //consoleLog('lt_rows: ', lt_rows, 229);
            
            for (let task of lt_rows) {

                task.displayNav = {
                    "main": !!task.display_main,
                    "next": !!task.display_next
                };

                task.pagecenter = true;

                params.lesson.tasks.push(task);

            }

            getTasksDictionaries(params);

        }
    });
}

function getTasksDictionaries(params) {

    // REQUIRED PARAMS
    // ===============
    // task_id
    let lesson = params.lesson;
    let pendingTasks = lesson.tasks.length;

    for (let i in lesson.tasks) {

        lesson.tasks[i].dictionary = [];

        lesson.tasks[i].lang_code = params.lang_code;
        lesson.tasks[i].country_code = params.country_code;

        lesson_query.getTaskDictionary(lesson.tasks[i], (td_err, td_rows) => {

            if(td_err) {

                consoleLog('Error: ', td_err);

            } else {



                if (td_rows.length > 0) {
                    //consoleLog('td_rows: ', td_rows, 276);
                    let pendingTaskTerms = td_rows.length;

                    for (let term of td_rows) {

                        lesson.tasks[i].dictionary.push(term);

                        if ((0 === --pendingTaskTerms || 0 === pendingTaskTerms)
                            && (0 === --pendingTasks || 0 === pendingTasks)) {
                            getTaskGroups(params);
                        }

                    }
                } else {

                    if ((0 === --pendingTasks || 0 === pendingTasks)) {
                        getTaskGroups(params);
                    }

                }
            }

        })
    }
}

function getTaskGroups(params) {

    // REQUIRED PARAMS
    // ===============
    // task_id
    let lesson = params.lesson;
    let pendingTasks = lesson.tasks.length;

    for (let i in lesson.tasks) {

        lesson.tasks[i].content = [];
        lesson_query.getTaskGroups(lesson.tasks[i], (lg_err, lg_rows) => {
            if(lg_err) {
                consoleLog('Error: ', lg_err);
            } else {
                //consoleLog('lg_rows: ', lg_rows, 320);

                if (lg_rows.length > 0) {
                    let pendingTaskGroups = lg_rows.length;
                    for (let group of lg_rows) {

                        lesson.tasks[i].content.push(group);

                        if ((0 === --pendingTaskGroups || 0 === pendingTaskGroups)
                            && (0 === --pendingTasks || 0 === pendingTasks)) {
                            getTaskGroupContent(params);
                        }
                    }

                } else {

                    if ((0 === --pendingTasks || 0 === pendingTasks)) {

                        getTaskGroupContent(params);

                    }

                }
            }
        });
    }
}

function getTaskGroupContent(params) {

    // REQUIRED PARAMS
    // ===============
    // tg_id (task_group_id)


    let lesson = params.lesson;
    let pendingTasks = lesson.tasks.length;
    for(let task_idx in lesson.tasks){
        
        if(lesson.tasks[task_idx].content.length > 0){

            let pendingTaskGroups = lesson.tasks[task_idx].content.length;
            for(let cgroup_idx in lesson.tasks[task_idx].content){
                
                // console.log('===================================================');
                // console.log('===================================================');
                // console.log('pendingTaskGroups: ', pendingTaskGroups)
                // console.log('lesson.tasks[task_idx]: ', lesson.tasks[task_idx])
                // console.log('===================================================');
                // console.log('===================================================');

                //lesson.tasks[task_idx].content[cgroup_idx].fields = [];
                
                lesson_query.getTaskGroupContent(lesson.tasks[task_idx].content[cgroup_idx], (tgc_err, tgc_rows) => {
                    if(tgc_err) { console.log('Error: ', tgc_err); } // throw tgc_err }
                    else {
                        consoleLog('[[[[[[[[[[[[[[[[[[[[[', '', 370);
                        consoleLog('TASK GROUP', lesson.tasks[task_idx].content[cgroup_idx], 370)

                        let contentBlock = {};
                        
                        if(tgc_rows.length > 0){
                            // console.log('===================================================');
                            // console.log('===================================================');
                            // console.log('tgc_rows: ', tgc_rows)
                            // console.log('===================================================');
                            // console.log('===================================================');


                            for(let f_idx in tgc_rows){

                                // console.log(tgc_rows[f_idx].content_id.split('-'));

                                let tempSplit = tgc_rows[f_idx].content_id.split('-');
                                tgc_rows[f_idx].version_id = tempSplit[tempSplit.length - 1];

                                consoleLog('----------------------------------------------', '', 390);
                                consoleLog('id: ', tgc_rows[f_idx].content_id, 391);
                                consoleLog('value: ', tgc_rows[f_idx].template_value, 392);
                                consoleLog('version: ', tgc_rows[f_idx].version_id, 393);
                                consoleLog('----------------------------------------------', '', 394);
                                consoleLog(' ', ' ');
                                
                            }
                            let contentArr = [];
                            
                            variationLoop: for(let v_group of params.variation_groups){

                                contentLoop: for(let f_idx in tgc_rows){

                                    consoleLog('v_group.version_id', v_group.version_id, 408)
                                    consoleLog('tgc_rows[f_idx].version_id', tgc_rows[f_idx].version_id, 409);
                                    // console.log('tgc_rows[f_idx]: ', tgc_rows[f_idx]);
                                    versionExists = contentArr.filter(x => x.task_group_id === tgc_rows[f_idx].task_group_id && x.attr_id === tgc_rows[f_idx].attr_id);
                                    if((+v_group.version_id === +tgc_rows[f_idx].version_id) && (versionExists.length === 0)){

                                        contentArr.push(tgc_rows[f_idx])

                                    }

                                }
                                // console.log('tgc_rows:' , tgc_rows)

                            }
                            console.log('contentArr: ', contentArr)
                            consoleLog(']]]]]]]]]]]]]]]]]]]]]', '', 535);
                            // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
                            let pendingTaskGroupContent = contentArr.length;

                            for(let field of contentArr){
                                
                                // console.log('field.type: ', field.type);
                                // console.log('field: ', field);
                                // console.log('country_code: ', country_code);
                                // console.log('lang_code: ', lang_code);

                                let localSearchParams = {
                                    item_id: field.content_id,
                                    lang_code: params.lang_code,
                                    country_code: params.country_code
                                }
                                
                                // console.log('FIELD: ', field);
                                // console.log('localSearchParams: ', localSearchParams)

                                lesson_query.getTaskLocalizedContent(localSearchParams, (tlc_err, tlc_rows) => {
                                    if(tlc_err) { console.log('Error: ', tlc_err); } // throw tlc_err }
                                    else {
                                        // console.log('localSearchParams: ', localSearchParams)
                                        // console.log('RESULT: ', tlc_rows)
                                        let localContent = field.template_value;

                                        
                                        // console.log('ITEM ID: ', tlc_rows);

                                        if(tlc_rows.length > 0 && tlc_rows[0].value !== '' && tlc_rows[0].value !== null){
                                            //cycle through to use correct variation
                                            localContent = tlc_rows[0].value;
                                            for(let cv_idx in tlc_rows){
                                                // console.log('ITEM ID: ', tlc_rows[cv_idx].item_id);
                                            }
                                        }

                                        if(field.el_group){
                                            contentBlock[field.el_group] = contentBlock[field.el_group] || {};
                                            contentBlock[field.el_group][field.el_type] = localContent;

                                        } else if(!field.el_type){
                                            // console.log('=========================================')
                                            // console.log('=========== ( NOTHING FOUND ) ===========')
                                            // console.log('=========================================')
                                            contentBlock[field.el_type] = localContent;
                                        }

                                        lesson.tasks[task_idx].content[cgroup_idx] = contentBlock;
        
                                        // console.log('=========================================')
                                        // console.log('=========================================')
                                        // console.log('=====: ', tlc_rows);
                                        // console.log('=====: ', contentBlock);
                                        // console.log('pendingTaskGroupContent: ', pendingTaskGroupContent)
                                        // console.log('pendingTaskGroups: ', pendingTaskGroups)
                                        // console.log('pendingTasks: ', pendingTasks)
                                        // console.log('=========================================')
                                        // console.log('=========================================')

                                        if( (0 === --pendingTaskGroupContent || 0 === pendingTaskGroupContent)
                                        &&  (0 === --pendingTaskGroups || 0 === pendingTaskGroups)
                                        &&  (0 === --pendingTasks || 0 === pendingTasks) ) {
                                            consoleLog('Variation Groups', params.variation_groups, 445)
                                            params.lesson = lesson;
                                            reqComplete(params.lesson);
                                        }

                                    }
                                })

                            }
                        } else {

                            lesson.tasks[task_idx].content[cgroup_idx] = contentBlock;                            

                            if( (0 === --pendingTaskGroups || 0 === pendingTaskGroups)
                            &&  (0 === --pendingTasks || 0 === pendingTasks) ) {
                                consoleLog('Variation Groups', params.variation_groups, 445)
                                params.lesson = lesson;
                                reqComplete(params.lesson);
                            }
                        }

                    }

                })
            }
        } else {
                            
            if( (0 === --pendingTasks || 0 === pendingTasks) ) {
                lesson.tasks[task_idx].content[cgroup_idx] = contentBlock;
                consoleLog('Variation Groups', params.variation_groups, 445)
                params.lesson = lesson;
                reqComplete(params.lesson);
            }
        }
    }

}

function reqComplete(result) {
    consoleLog('RESULT:', result, 548)
    console.log('complete!');
    response.json(result);
}

module.exports = app;
