export class Queue {
  constructor(data = null) {
    this.length = 0;
    if (data) {
      this.enqueue(data);
    } else {
      this.head = null;
      this.tail = null;
    }
  }

  enqueue(data) {
    let queueAddition = new Node(data);
    if (this.tail) {
      this.tail.next = queueAddition;
      this.tail = queueAddition;
    } else {
      this.head = queueAddition;
      this.tail = queueAddition;
    }
    this.length++;
  }

  dequeue() {
    if (this.head === null) {
      return null;
    } else {
      let queueRemoval = this.head;
      this.head = queueRemoval.next;
      if (this.head === null) {
        this.tail = null;
      }
      queueRemoval.next = null;
      this.length--;
      return queueRemoval.data;
    }
  }
}

class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}
