define([
    "writer/common/Container"
], function(Container) {
    describe("writer.test.ut.writer.common.Container", function() {
        it("Check append and prev, next, first, last, contains, replace, remove", function() {
            var c = new Container();
            var node = {
                _id: 11
            };
            c.append(node);
            var node2 = {
                _id: 22
            };
            c.append(node2);

            expect(c.length()).toEqual(2);
            expect(c.getFirst()._id).toEqual(11);
            expect(c.getLast()._id).toEqual(22);
            expect(c.prev(c.getLast())).toEqual(c.getFirst());
            expect(c.next(c.getFirst())).toEqual(c.getLast());
            expect(c.prev(c.getFirst())).toEqual(null);
            expect(c.next(c.getLast())).toEqual(null);
            expect(c.isEmpty()).toEqual(false);
            expect(c.indexOf(node2)).toEqual(1);
            expect(c.indexOf(node)).toEqual(0);
            expect(c.contains(node)).toBeTruthy();

            var node3 = {
                _id: 3
            };

            expect(c.contains(node3)).toBeFalsy();
            expect(c.getByIndex(1)).toEqual(node2);
            expect(c.getByIndex(2)).toEqual(null);

            c.replace(node3, node2)

            expect(c.contains(node3)).toBeTruthy();
            // expect(c.contains(node2)).toBeFalsy(); // !!!! chrome. firefox different
            expect(c.getByIndex(1)).toEqual(node3);

            var arr = c.toArray();
            expect(arr.length).toEqual(2);
            expect(arr[0]).toEqual(node);
            expect(arr[1]).toEqual(node3);
            c.remove(node3);
            expect(c.contains(node3)).toBeFalsy();
            expect(c.length()).toEqual(1);
            c.removeAll();
            expect(c.length()).toEqual(0);
        });

        it("Check append front", function() {
            var c = new Container();
            var node = {
                _id: 11
            };
            c.append(node);
            var node2 = {
                _id: 22
            };
            c.appendFront(node2);
            expect(c.getFirst()._id).toEqual(22);
            expect(c.getLast()._id).toEqual(11);
        });

        it("Check append all container", function() {

            var c = new Container();
            var node = {
                _id: 11
            };
            c.append(node);
            var node2 = {
                _id: 22
            };
            c.append(node2);

            var c2 = new Container();
            var node3 = {
                _id: 33
            };
            c2.append(node3);
            var node4 = {
                _id: 44
            };
            c2.append(node4);

            c.appendAll(c2)
            expect(c.length()).toEqual(4);
            expect(c.getLast()._id).toEqual(44);

            var c3 = new Container();
            var node5 = {
                _id: 55
            };
            c3.append(node5);
            var node6 = {
                _id: 66
            };
            c3.append(node6);

            c.appendAllFront(c3);

            expect(c.length()).toEqual(6);
            expect(c.getFirst()._id).toEqual(55);
            expect(c.getLast()._id).toEqual(44);
        });

        it("Check merge container", function() {

            var c = new Container();
            var node = {
                _id: 11
            };
            c.append(node);
            var node2 = {
                _id: 22
            };
            c.append(node2);

            var c2 = new Container();
            var node3 = {
                _id: 33
            };
            c2.append(node3);
            var node4 = {
                _id: 44
            };
            c2.append(node4);

            c.merge(c2)
            expect(c.getLast()._id).toEqual(44);
            expect(c2.length()).toEqual(0);
        });

        it("Insert into container", function() {
            var c = new Container();
            var node = {
                _id: 11
            };
            c.append(node);
            var node2 = {
                _id: 22
            };
            c.append(node2);

            var node3 = {
                _id: 33
            };

            c.insertAfter(node3);

            expect(c.getLast()._id).toEqual(33);
            expect(c.length()).toEqual(3);

            c.insertAfter(node3, c.getFirst());

            expect(c.next(c.getFirst())._id).toEqual(33);
            expect(c.length()).toEqual(4);

            c.insertBefore(node3, c.getFirst());

            expect(c.getFirst()._id).toEqual(33);
            expect(c.length()).toEqual(5);

            c.insertAt(node3, 5);

            expect(c.getLast()._id).toEqual(33);
            expect(c.length()).toEqual(6);
        });

        it("Insert all into container", function() {
            var c = new Container();
            var node = {
                _id: 11
            };
            c.append(node);
            var node2 = {
                _id: 22
            };
            c.append(node2);

            var c2 = new Container();
            var node3 = {
                _id: 33
            };
            c2.append(node3);
            var node4 = {
                _id: 44
            };
            c2.append(node4);

            c.insertAllAfter(c2, c.getFirst());

            expect(c.getFirst()._id).toEqual(11);
            expect(c.next(c.getFirst())._id).toEqual(33);
            expect(c.getLast()._id).toEqual(22);
            expect(c.length()).toEqual(4);

            var c3 = new Container();
            var node5 = {
                _id: 55
            };
            c3.append(node5);
            var node6 = {
                _id: 66
            };
            c3.append(node6);

            c.insertAllBefore(c3, c.getFirst());

            expect(c.getFirst()._id).toEqual(55);

            expect(c.next(c.getFirst())._id).toEqual(66);
            expect(c.getLast()._id).toEqual(22);
            expect(c.length()).toEqual(6);
        });

        it("Foreach and select container", function() {
            var c = new Container();
            var node = {
                _id: 11
            };
            c.append(node);
            var node2 = {
                _id: 22
            };
            c.append(node2);

            var sum = 0;
            c.forEach(function(n) {
                sum += n._id;
            })

            expect(sum).toEqual(33);

            var node = c.select(function(n) {
                return n._id > 20;
            })

            expect(node._id).toEqual(22);

            var node = c.selectReverse(function(n) {
                return n._id > 10;
            })

            expect(node._id).toEqual(22);

            var node = c.select(function(n) {
                return n._id > 10;
            })

            expect(node._id).toEqual(11);
        });

        it("Divide", function() {
            var c = new Container();
            var node = {
                _id: 11
            };
            c.append(node);
            var node2 = {
                _id: 22
            };
            c.append(node2);

            var c2 = c.divide(node);
            expect(c.length()).toEqual(2);
            expect(c2.length()).toEqual(2);

            var c2 = c.divide(node2);
            expect(c.length()).toEqual(1);
            expect(c2.length()).toEqual(1);
        });

    });

});
