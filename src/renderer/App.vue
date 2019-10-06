<template>
  <div id="app">
    <div class="container-fluid" id="root">
      <small>
        <span class="title">도서 검색</span>
        서버 - {{ url }} -
        <span>{{ status }}</span>
      </small>
      <b-field>
        <b-select v-model="type" id="search-type" placeholder="검색 유형">
          <option value="title" selected>제목</option>
          <option value="author">저자</option>
          <option value="isbn">ISBN</option>
        </b-select>
        <b-input v-model="query" id="search-query" placeholder="검색..." icon="magnify" expanded></b-input>
        <p class="control">
          <b-button class="button is-primary" @click="search()">검색</b-button>
        </p>
      </b-field>
        <div id="empty" v-if="list.length === 0">
          <h5>검색 결과가 없습니다.</h5>
        </div>
      <div class="card-columns">
        <div class="card" v-for="item in list" v-bind:key="item">
          <img :src="item.imageUrl" class="card-img-top" :alt="item.title"/>
          <div class="card-body">
            <h5 class="card-title">{{item.title}}</h5>
            <p
              class="card-text"
            >{{item.author}} 저</p>
          </div>
          <div class="card-footer">
          <p class="card-text">
              <small class="text-muted">ISBN - {{item.isbn}}</small><br>
              <small class="text-muted">출판일자 - {{item.publishedAt}}</small><br>
              <small class="text-muted">대출상태 - {{item.statusDesc}}</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>

<!-- Popper -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>

<!-- Latest compiled and minified Bootstrap JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>

<script>
export default {
  name: "manager-client",
  components: {},
  data: () => {
    return {
      type: "title",
      query: "",
      url: "http://localhost:3000",
      list: [],
      status: "연결 안 됨",
    };
  },
  methods: {
    search: function() {
      this.list = [];
      this.checkServer();
      this.Query();
    },
    Query: function() {
      var request = require("request");
      var self = this;
      if(self.query === "") {
        request.get(
        self.url + "/api/search/" + encodeURI(self.query),
        function(err, res, body) {
          var items = JSON.parse(body);
          for (var item in items) {
            if(items[item].status === 1) {
              items[item].statusDesc = "대출되지 않음";
            }
            else {
              var lastLog = items[item].rentalLog[items[item].rentalLog.length - 1];
              items[item].statusDesc = lastLog.userId + " 님이 " + lastLog.returnAt + " 까지 대출중";
            }
            self.list.push(items[item]);
          }
        }
        );
        return;
      }
      request.get(
        self.url + "/api/search/" + self.type + "/" + encodeURI(self.query),
        function(err, res, body) {
          var items = JSON.parse(body);
          for (var item in items) {
            if(items[item].status === 1) {
              items[item].statusDesc = "대출되지 않음";
            }
            else {
              var lastLog = items[item].rentalLog[items[item].rentalLog.length - 1];
              items[item].statusDesc = lastLog.userId + " 님이 " + lastLog.returnAt + " 까지 대출중";
            }
            self.list.push(items[item]);
          }
        }
      );
    },
    checkServer: function() {
      var request = require("request");
      var self = this;
      request.get(self.url + "/api/status", function(err, res, body) {
        if (JSON.parse(body).status === 1) {
          self.status = "연결됨";
        }
      });
    }
  }
};
</script>

<style>
@import url("https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css");
@import url("https://cdn.materialdesignicons.com/2.5.94/css/materialdesignicons.min.css");

#root {
  margin-top: 50px;
  min-width: 600px;
  max-width: 1080px;
  min-height: 600px;
}

.title {
  font-weight: normal;
}

.card {
  display: inline-block;
}

.card-columns {
  column-count: 3;
}
</style>
