/**
 * Created by Ely on 3/26/2015.
 */
module.exports = function (wrangler, tasks) {
    if (tasks.length === 0) {
        return [];
    }

    tasks = wrangler.sortTaskKeysByPriority(tasks, 1).filter(function (key) {
        key = wrangler.splitWranglerCommand(key).taskAlias;
        return sjl.isset(wrangler.tasks[key]) && sjl.isset(wrangler.tasks[key].priority);
    });

    function getPriority(key) {
        return parseInt(wrangler.tasks[key].priority, 10);
    }

    function depsMapItem(item) {
        var retVal = item;
        if (sjl.classOfIs(item, 'String')) {
            retVal = {
                command: item,
                deps: [],
                priority: getPriority(wrangler.splitWranglerCommand(key).taskAlias),
                topLevelAlias: wrangler.splitWranglerCommand(item).taskAlias
            };
        }
        return retVal;
    }

    function findClosestLowerPriorityObj (depsMapObjs, item) {
        var prevDiff = Number.POSITIVE_INFINITY,
            lowestObj;
        depsMapObjs.forEach(function (obj) {
            var diff = item.priority > obj.priority ? item0.priority - obj.priority : obj.priority - item.priority;
            if (diff <= prevDiff) {
                lowestObj = obj;
                prevDiff = diff;
            }
        });
        return lowestObj.priority === item.priority ? 0 : lowestObj;
    }

    function mapObjsToDepsMap (objs, depsMap) {
        objs.forEach(function (obj) {
            var lowestPriorityObj = findClosestLowerPriorityObj(obj);
            lowestPriorityObj.priority === obj.priority ?
                depsMap.push(obj) : lowestPriorityObj.deps.push(obj);
        });
        return depsMap;
    }

    function getDepsMapObjs (tasks) {
        return tasks.map(function (item) {
            return depsMapItem(item);
        });
    }

    return mapObjsToDepsMap(getDepsMapObjs(tasks), []);

};