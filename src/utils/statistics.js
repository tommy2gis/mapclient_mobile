/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:32:10 
 * @Last Modified by:   史涛 
 * @Last Modified time: 2019-01-05 19:32:10 
 */
const GetJenksBreaks = (data, numclass) => {
    //在javascript里，Array的sort方法，必须用这个函数，否则不是按数字大小排序
    function sortNumber(a, b) {
        return a - b;
    }

    // int numclass;
    var numdata = data.length;
    data.sort(sortNumber); //先排序
    var mat1 = new Array();
    var mat2 = new Array();
    var st = new Array();
    var j = 0, i = 0;
    for (j = 0; j <= numdata; j++) {
        mat1[j] = new Array();
        mat2[j] = new Array();
        st[j] = 0;
        for (i = 0; i <= numclass; i++) {
            mat1[j][i] = 0;
            mat2[j][i] = 0;
        }
    }
    for (i = 1; i <= numclass; i++) {
        mat1[1][i] = 1;
        mat2[1][i] = 0;
        for (j = 2; j <= numdata; j++) {
            mat2[j][i] = Number.MAX_VALUE;
        }
    }
    var v = 0;
    for (var l = 2; l <= numdata; l++) {
        var s1 = 0;
        var s2 = 0;
        var w = 0;
        var i3 = 0;
        for (var m = 1; m <= l; m++) {
            i3 = l - m + 1;
            var val = parseInt(data[i3 - 1]);
            s2 += val * val;
            s1 += val;
            w++;
            v = s2 - (s1 * s1) / w;
            var i4 = i3 - 1;
            if (i4 != 0) {
                for (j = 2; j <= numclass; j++) {
                    if (mat2[l][j] >= (v + mat2[i4][j - 1])) {
                        mat1[l][j] = i3;
                        mat2[l][j] = v + mat2[i4][j - 1];
                        //if (l == 200 && j == 5)
                        //    alert("l=" + 200 + ",j=" + 5 + ";mat2[200][5]=" + mat1[l][j] + "i3=" + i3);
                    }
                }
            }
        }
        mat1[l][1] = 1;
        mat2[l][1] = v;
    }
    var k = numdata;
    var kclass = new Array();
    /* int[] kclass = new int[numclass]; */
    kclass[numclass - 1] = parseInt(data[data.length - 1]);
    /* kclass[numclass - 1] = (Integer) data.get(data.size() - 1); */
    for (j = numclass; j >= 2; j--) {
        var id = parseInt(mat1[k][j]) - 2;
        kclass[j - 2] = parseInt(data[id]);
        k = parseInt(mat1[k][j] - 1);
    }
    return kclass;
};

module.exports ={GetJenksBreaks};

