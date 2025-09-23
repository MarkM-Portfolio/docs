define([
	"writer/common/Container",
	"writer/common/SubContainer"
], function (Container, SubContainer) {

	describe("writer.test.ut.writer.common.SubContainer", function() {
	
		it("Check basic and prev, next, first, last, contains, indexOf", function() {
			
			var c = new Container();
			var node = {_id: 11};
			c.append(node);
			var node2 = {_id: 22};
			c.append(node2);
			var node3 = {_id: 33};
			c.append(node3);
			var node4 = {_id: 44};
			c.append(node4);
			
			var s = new SubContainer(c, node2, node3);
			expect(s.length()).toEqual(2);
			expect(s.isEmpty()).toEqual(false);
			expect(s.getFirst()).toEqual(node2);
			expect(s.getLast()).toEqual(node3);
			expect(s.prev(s.getFirst())).toEqual(null);
			expect(s.prev(node3)).toEqual(node2);
			expect(s.next(s.getLast())).toEqual(null);
			expect(s.next(node2)).toEqual(node3);
			expect(s.getByIndex(1)).toEqual(node3)
			expect(s.indexOf(node2)).toEqual(0);
			expect(s.indexOf(node4)).toEqual(2); // !!
			expect(s.contains(node2)).toBeTruthy();
			expect(s.contains(node4)).toBeTruthy(); // !!
			
			s.remove(node3);
			expect(s.length()).toEqual(1);
			expect(s.getLast()).toEqual(node2);
			expect(s.isEmpty()).toEqual(false);
			
			s.remove(node2);
			expect(s.length()).toEqual(0);
			expect(s.isEmpty()).toEqual(true);
		});
		
		it("Insert into container", function() {
			
			var c = new Container();
			var node = {_id: 11};
			c.append(node);
			var node2 = {_id: 22};
			c.append(node2);
			var node3 = {_id: 33};
			c.append(node3);
			var node4 = {_id: 44};
			c.append(node4);
			
			var s = new SubContainer(c, node2, node3);
	
			var node5 = {_id: 55};
			s.insertAfter(node5);
			
			expect(s.getLast()._id).toEqual(33);
			expect(s.length()).toEqual(2);
			
			var node6 = {_id: 66};
			s.insertAfter(node6, s.getFirst());
			
			expect(s.next(s.getFirst())._id).toEqual(66);
			expect(s.length()).toEqual(3);
			
			var node7 = {_id: 77};
			s.insertBefore(node7, s.getFirst());
			
			expect(s.getFirst()._id).toEqual(77);
			expect(s.length()).toEqual(4);
			
		});
		
		it("Foreach and select container", function() {
			
			var c = new Container();
			var node = {_id: 11};
			c.append(node);
			var node2 = {_id: 22};
			c.append(node2);
			var node3 = {_id: 33};
			c.append(node3);
			var node4 = {_id: 44};
			c.append(node4);
			
			var s = new SubContainer(c, node2, node3);
			
			var sum = 0;
			s.forEach(function(n){
				sum += n._id;
			})
			
			expect(sum).toEqual(55);
			
			var node = s.select(function(n){
				return n._id > 20;
			})
			
			expect(node._id).toEqual(22);
			
			
			var node = s.select(function(n){
				return n._id > 23;
			})
			
			expect(node._id).toEqual(33);
		});
		
		it("Divide", function() {
			
			var c = new Container();
			var node = {_id: 11};
			c.append(node);
			var node2 = {_id: 22};
			c.append(node2);
			var node3 = {_id: 33};
			c.append(node3);
			var node4 = {_id: 44};
			c.append(node4);
			
			var s = new SubContainer(c, node2, node3);
			
			var s2 = s.divide(node2);
			expect(s.length()).toEqual(2);
			expect(s2.length()).toEqual(2);
			
			var s2 = s.divide(node3);
			expect(s.length()).toEqual(1);
			expect(s2.length()).toEqual(1);
		});
		
		it("set start and check valid", function() {
			
			var c = new Container();
			var node = {_id: 11};
			c.append(node);
			var node2 = {_id: 22};
			c.append(node2);
			var node3 = {_id: 33};
			c.append(node3);
			var node4 = {_id: 44};
			c.append(node4);
			
			var s = new SubContainer(c, node2, node3);
			
			var node5 = {_id: 55};
			
			s.setStart(node4)
			expect(s.isValid()).toBeTruthy(); // !!
			s.setStart(node5)
			expect(s.isValid()).toBeTruthy(); // !!
			s.setEnd(node5)
			expect(s.isValid()).toBeFalsy(); // !!
			s.setStart(node2)
			expect(s.isValid()).toBeTruthy();
			s.reset()
			expect(s.isValid()).toBeFalsy();
		});
	
		
	});

});