/**
 * Created by Ely on 12/17/2014.
 */
module.exports = {

    /**
     * Clones an object the dirty way.
     * @param obj
     * @returns {*}
     */
    clone: function (objOrArray) {
        if (!objOrArray) {
            return;
        }

        var classOfObj = sjl.classOf(objOrArray);

        if (classOfObj === 'Array' && objOrArray.length > 0) {
            objOrArray = objOrArray.map(function (item) {
                return sjl.classOfIs(item, 'Object') ? clone(item) : item;
            });
        }

        else if (classOfObj === 'Object' && !sjl.empty(objOrArray)) {
            clone(objOrArray);
        }

        return objOrArray;
    }

};