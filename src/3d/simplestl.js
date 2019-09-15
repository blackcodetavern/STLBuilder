var simplestl = (function() {
  //obj from simplelinearalgebra
  var getFullTextSTL = function(obj) {
    var result = "";
    for (var i = 0; i < obj.arrayOfTriangles.length; i++) {
      var cp1 = obj.arrayOfTriangles[i].vertices.v1;
      var cp2 = obj.arrayOfTriangles[i].vertices.v2;
      var cp3 = obj.arrayOfTriangles[i].vertices.v3;
      var norm = obj.arrayOfTriangles[i].norm;
      result += `facet normal ${Math.round(norm.x * 100) / 100} ${Math.round(
        norm.z * 100
      ) / 100} ${Math.round(norm.y * 100) / 100}
                outer loop
                vertex ${Math.round(cp1.x * 100) / 100} ${Math.round(
        cp1.z * 100
      ) / 100} ${Math.round(cp1.y * 100) / 100}
                vertex ${Math.round(cp2.x * 100) / 100} ${Math.round(
        cp2.z * 100
      ) / 100} ${Math.round(cp2.y * 100) / 100}
                vertex ${Math.round(cp3.x * 100) / 100} ${Math.round(
        cp3.z * 100
      ) / 100} ${Math.round(cp3.y * 100) / 100}
                endloop
                endfacet
            `;
    }
    return "solid name\n" + result + "endsolid name";
  };

  //Next release
  var getBinarySTL = function(obj) {};

  return {
    getFullTextSTL
  };
})();

export default simplestl;
