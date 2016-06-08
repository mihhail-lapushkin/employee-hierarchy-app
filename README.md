http://employee-hierarchy-app.herokuapp.com (might be sleeping so expect delays and absence of data initially)

* No error cases like empty responses from server, empty values in forms etc are handled.
* In the edit form the selection list represents managers of the employee. Use Ctrl/Cmd + Click to select many.
* Visualization does not support loops or having 2 managers from different "levels". Results for those are undefined.
* Visualization is optimized for regular single-manager trees. Subordinates with many managers have red connections to them instead of gray ones.
* In general, picture with many multi-manager connections looks messy.
