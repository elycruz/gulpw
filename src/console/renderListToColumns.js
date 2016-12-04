/**
 * Created by u067265 on 12/4/16.
 * @todo This function should take into account the views width as well as the total length of the longest word per column
 * along with it's tab space to make sure words can fit in view and then formatting should occur so that all the columns
 * space out evenly (may have to even restart/recalculate num items per columns and num columns again effectively retriggering
 * all the other calculations again.
 * @note Functions ending with '$' are side effectual.
 */

'use strict';

let sjl = require('sjljs');

function shift$ (list) {
    return list.length > 0 ? list.shift() : null;
}

function tailEnd(list) {
    return list[list.length - 1];
}

function findLongest(list) {
    return list.reduce((agg, str) => {
        return agg.length > str.length ? agg : str;
    }, '');
}

function renderFormattedColumns (columns, columnSpacing, longestWordPerColumn) {
    let numColumns = columns.length,
    longestColumnLen = columns.reduce((agg, column) => agg > column.length ? agg : column.length, 0),
        tab = ' '.repeat(columnSpacing);
    var out = '';
    while (longestColumnLen) {
        for (var i = 0; i < numColumns; i += 1) {
            out += (shift$(columns[i]) || ''.repeat(longestWordPerColumn.length)) +
                (i === numColumns - 1 ? '\n' : tab);
        }
        longestColumnLen--;
    }
    return out;
}

function renderListToColumns(list, numColumns = 3, itemPrefix = '- ', columnSpacing = 4, approximateViewWidth = 72) {
    let itemsPerColumn = Math.round(list.length / numColumns);

    if (!sjl.isNumber(itemsPerColumn)) {
        return list.length > 0 ? list.join('\n') : 'Nothing to show.\n';
    }

    // reduce to columns
    let columns = list.sort().reduce((agg, str) => {
            const tailEndItem = tailEnd(agg);
            if (tailEndItem.length < itemsPerColumn) {
                tailEndItem.push(str);
            }
            else {
                agg.push([str]);
            }
            return agg;
        }, [[]]),
        longestWordPerColumn = columns.map(column => {
            return findLongest(column);
        }),
        formattedColumns = columns.map((column, index) => {
            let longestWord = longestWordPerColumn[index];
            return column.map(item => {
                let renderedWord = itemPrefix + item,
                    diff = longestWord.length - item.length;
                return renderedWord + (diff > 0 ? ' '.repeat(longestWord.length - item.length) : '');
            });
        });

    return renderFormattedColumns(formattedColumns, columnSpacing, longestWordPerColumn);
}

module.exports = renderListToColumns;
