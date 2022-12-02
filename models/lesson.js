var mysql = require('mysql');

var connection = require('./connection');

function consoleLog(msg){
    //consoleLog(msg);
}
function consoleSql(msg){
    let sqlmsg = msg.replace(/\s\s+/g, ' ');
    //console.log(sqlmsg);
}
module.exports.isCountryMetric = function(params, callback) {
    
    // REQUIRED PARAMS
    // ===============
    // country_code

    consoleLog('PARAMS (isCountryMetric): ', params);

    let query = `
        SELECT  cvp.name,
                cvp.property_id,
                cvp.category_id

        FROM country_property AS cp

            INNER JOIN content_version_property AS cvp
                ON cvp.property_id = cp.content_version_property_id
                
            INNER JOIN country AS c
                ON c.code = '` + params.country_code + `'
                
        WHERE
            cp.country_id = c.country_id
            AND
            cp.content_version_property_id = 6

    `;

    consoleSql(query);

	connection.query(query, callback);

};
module.exports.isCountryImperial = function(params, callback) {
    
    // REQUIRED PARAMS
    // ===============
    // country_code

    consoleLog('PARAMS (isCountryImperial): ', params);

    let query = `
        SELECT  cvp.name,
                cvp.property_id,
                cvp.category_id

        FROM country_property AS cp

            INNER JOIN content_version_property AS cvp
                ON cvp.property_id = cp.content_version_property_id
                
            INNER JOIN country AS c
                ON c.code = '` + params.country_code + `'
                
        WHERE
            cp.country_id = c.country_id
            AND
            cp.content_version_property_id = 5

    `;

    consoleSql(query);

	connection.query(query, callback);

};
module.exports.langDirection = function(params, callback) {
    
    // REQUIRED PARAMS
    // ===============
    // country_code

    consoleLog('PARAMS (langDirection): ', params);

    let query = `
        SELECT  l.text_dir

        FROM language AS l
   
        WHERE
            l.code = '` + params.lang_code + `'

    `;

    consoleSql(query);

	connection.query(query, callback);

};

module.exports.getCountryProps = function(params, callback) {
    
    // REQUIRED PARAMS
    // ===============
    // lesson_id

    // RETURNED OBJECT
    // ===============
    // vers array

    consoleLog('PARAMS (getCountryProps): ', params);

    let query = `
        SELECT  cvp.name,
                cvp.property_id,
                cvp.category_id

        FROM country_property AS cp

            INNER JOIN content_version_property AS cvp
                ON cvp.property_id = cp.content_version_property_id
                
            INNER JOIN country AS c
                ON c.code = '` + params.country_code + `'
                
        WHERE
            cp.country_id = c.country_id

    `;

    consoleSql(query);

    connection.query(query, callback);

};

module.exports.getVariationGroups = function(params, callback) {
    
    // REQUIRED PARAMS
    // ===============
    // 

    // RETURNED OBJECT
    // ===============
    // vers group array
    // vers group properties

    consoleLog('PARAMS (getVariationGroups): ', params);

    let query = `
        SELECT  cv.version_id,
                cv.name,
                cv.device,
                cv.priority

        FROM content_version AS cv

        ORDER BY
            cv.device DESC,
            cv.priority DESC

    `;

    consoleSql(query);

    connection.query(query, callback);

};

module.exports.getVariationGroupProps = function(vgpVersionIds, callback) {

    let verIdsStr = "'" + vgpVersionIds.join("','") + "'";

    consoleLog('PARAMS (getVariationGroupProps): ', vgpVersionIds);

    let query = `
        SELECT  cvg.version_id,
                cvg.property_id,
                cvp.priority

        FROM
            content_version_group AS cvg

        INNER JOIN content_version_property AS cvp
            ON cvp.property_id = cvg.property_id

        WHERE
            cvg.version_id IN (` + verIdsStr + `)
    `;

    consoleSql(query);

    connection.query(query, callback);

};

module.exports.getLessonData = function(lesson_code, callback) {

    consoleLog('PARAMS (getLessonData): ', lesson_code);

    let query = `
        SELECT  l.name AS 'lesson_name',
                l.lesson_id,
                lt.name AS 'lesson_type',
                lt.type_id

        FROM lesson AS l

        INNER JOIN lesson_type AS lt
            ON lt.type_id = l.type_id

        WHERE
            l.code = '` + lesson_code + `'
            
        LIMIT 1;

    `;

    consoleSql(query);

    connection.query(query, callback);

};

module.exports.getLessonTasks = function(lesson_id, callback) {

    consoleLog('PARAMS (getLessonTasks): ', lesson_id);

    let query = `
        SELECT  t.name AS 'name',
                t.type_id AS 'task_type_id',
                tt.code_angular AS 'pagetype',
                lck.value AS 'lockType',
                lt.task_id,
                t.display_main,
                t.display_next,
                t.display_innav,
                t.lock_time AS 'lockTime'

        FROM lesson_task AS lt

            INNER JOIN task AS t
                ON t.task_id = lt.task_id
            
            INNER JOIN task_type AS tt
                ON tt.type_id = t.type_id

            INNER JOIN lock_type AS lck
                ON lck.lock_type_id = t.lock_type

        WHERE
            lt.lesson_id = '` + lesson_id + `'
            &&
            t.status_id = 1
        ORDER BY
            lt._order

    `;

    consoleSql(query);

    connection.query(query, callback);

};
module.exports.getTaskDictionary = function(params, callback) {

    // REQUIRED PARAMS
    // ===============
    // task_id

    // RETURNED OBJECT
    // ===============
    // tg_id (task_group_id)
    // ttag_id (task_type_attr_group_id)
    // group_name (name)

    consoleLog('PARAMS (getTaskDictionary): ', params);

    let query = `
        SELECT  d.term,
                d.selector,
                t.value

        FROM task_dictionary AS td

        INNER JOIN dictionary AS d
            ON d.term_id = td.dictionary_id
            
        INNER JOIN translation AS t
            ON 
                t.item_id = td.content_id
            AND
                t.language_code = '` + params.lang_code + `'
            AND
                t.country_code = '` + params.country_code + `'

        WHERE
            td.task_id = '` + params.task_id + `'

    `;

    consoleSql(query);

    connection.query(query, callback);

};


module.exports.getTaskGroups = function(params, callback) {

    // REQUIRED PARAMS
    // ===============
    // task_id

    // RETURNED OBJECT
    // ===============
    // tg_id (task_group_id)
    // ttag_id (task_type_attr_group_id)
    // group_name (name)

    consoleLog('PARAMS (getTaskGroups): ', params);

    let query = `
        SELECT  tg.task_group_id AS 'tg_id',
                tg.task_type_attr_group_id AS 'ttag_id',
                tag.name AS 'group_name'

        FROM task_group AS tg

        INNER JOIN task_type_attr_group AS ttag
            ON ttag.group_id = tg.task_type_attr_group_id
            
        INNER JOIN task_attr_group AS tag
            ON tag.group_id = ttag.attr_group_id

        WHERE
            tg.task_id = '` + params.task_id + `'

        ORDER BY tg._order

    `;

    consoleSql(query);

    connection.query(query, callback);

};

module.exports.getTaskGroupContent = function(params, callback) {

    // REQUIRED PARAMS
    // ===============
    // tg_id (task_group_id)

    // RETURNED OBJECT
    // ===============
    // default_value
    // template_value
    // version_id
    // label
    // placeholder
    // element
    // type

    consoleLog('PARAMS (getTaskGroupContent): ', params);

    let query = `
        SELECT  tc.value AS 'template_value',
                tc.version_id,
                ta.label,
                ta.placeholder,
                ta.default_value,
                ta.type AS 'el_type',
                ta.group AS 'el_group',
                tat.element,
                tat.type,
                tc.content_id,
                tc.task_group_id,
                tc.attr_id

        FROM task_content AS tc

        INNER JOIN task_attr AS ta
            ON ta.attr_id = tc.attr_id

        INNER JOIN task_attr_type AS tat
            ON tat.type_id = ta.attr_type_id
        
        INNER JOIN content_version AS cv
            ON cv.version_id = tc.version_id

        WHERE
            tc.task_group_id = '` + params.tg_id + `'
        
        ORDER BY ta._order
            AND
            cv.priority ASC

    `;

    consoleSql(query);

    connection.query(query, callback);

};

module.exports.getTaskLocalizedContent = function(params, callback) {

    // REQUIRED PARAMS
    // ===============
    // item_id: field.content_id,
    // lang_code: lang_code,
    // country_code: country_code

    // RETURNED OBJECT
    // ===============
    // value

    consoleLog('PARAMS (getTaskLocalizedContent): ', params);

    let query = `
        SELECT  t.value,
                t.item_id

        FROM translation AS t

        WHERE
            t.item_id = '` + params.item_id + `'
            AND
            t.language_code = '` + params.lang_code + `'
            AND
            t.country_code = '` + params.country_code + `'

    `;

    consoleSql(query);

    connection.query(query, callback);
    
};

//Get course code
module.exports.getCourseInfo = function(params, callback) {

    // REQUIRED PARAMS
    // ===============
    // lang_code: lang_code,
    // vehicle_code: vehicle_type

    // RETURNED OBJECT
    // ===============
    // value
   let searchString  = '';
   let vehicleCode = params.vehicle_type;
    
    if (vehicleCode){
       searchString = `AND v.code = '`+vehicleCode +`' `;
    }
        let query = ` SELECT c.course_id, c.code FROM lesson l 
        INNER JOIN course_lesson cl ON l.lesson_id = cl.lesson_id
        INNER JOIN course c ON c.course_id = cl.course_id
        INNER JOIN vehicle v ON  v.vehicle_id = l.vehicle_id
        WHERE l.code='` + params.lesson_code + `' `+ searchString +`  LIMIT 1 `;


        connection.query(query, callback);
};
// API Creation Code

module.exports.exporttojson = function (params, callback) {
    console.log('coming here......');

    let sql = `call sp_export_lesson_to_json(?, ?, ?, ?, ?, ?);`;
    connection.query(sql, [params.countrycode, params.langcode, params.lessoncode,params.deviceId, params.vehiclecode, params.versioncode], callback);
}
//API Creation Code end