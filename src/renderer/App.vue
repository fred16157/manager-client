<template>
  <div id="app">
    <div class="container-fluid" id="root">
      <small>
        <span class="title">도서 검색</span>
        서버 - {{ url }} -
        <span>{{ status }} -</span>
        <span>{{userId}} -</span>
        <button class="button is-primary" @click="isLoginModalActive=true">로그인</button>
      </small>
      <form id="search-form">
        <b-field>
          <b-select v-model="type" id="search-type" placeholder="검색 유형">
            <option value="title" selected>제목</option>
            <option value="author">저자</option>
            <option value="tag">태그</option>
            <option value="isbn">ISBN</option>
          </b-select>
          <b-input v-model="query" id="search-query" placeholder="검색..." icon="magnify" expanded></b-input>
          <p class="control">
            <b-button class="button is-primary" @click="search()">검색</b-button>
          </p>
        </b-field>
      </form>

      <div id="empty" v-if="list.length === 0">
        <h5>검색 결과가 없습니다.</h5>
      </div>
      <div id="tag-list" v-if="type === 'tag'">
        <h6>태그 목록</h6>
        <span
          class="badge badge-secondary"
          v-on:click="tagClick"
          v-for="tag in tags"
          v-bind:key="tag"
          style="margin-right: 5px;"
        >{{ tag }}</span>
      </div>
      <h5>{{list.length}}개 검색됨</h5>
      <div class="card-columns">
        <div
          class="card"
          v-for="item in list"
          v-bind:key="item"
          v-on:click="onItemClick(item)"
          data-target="detailModal"
        >
          <img :src="item.imageUrl" class="card-img-top" :alt="item.title" />
          <div class="card-body">
            <h5 class="card-title">{{item.title}}</h5>
            <p class="card-text">{{item.author}} 저</p>
            <div
              v-for="tag in item.tags"
              v-bind:key="tag"
              style="display: inline; margin-right: 5px;"
            >
              <span class="badge badge-secondary">{{tag}}</span>
            </div>
          </div>
          <div class="card-footer">
            <p class="card-text">
              <small class="text-muted">ISBN - {{item.isbn}}</small>
              <br />
              <small class="text-muted">출판일자 - {{item.publishedAt}}</small>
              <br />
              <small class="text-muted">대출상태 - {{item.statusDesc}}</small>
            </p>
          </div>
        </div>
      </div>
    </div>

    <b-modal :active.sync="isDetailModalActive" :width="640" scroll="keep">
      <div class="card">
        <div class="card-image" style="height: 800px; width: 600px;">
          <figure class="image is-6by19">
            <img :src="selectedItem.imageUrl" style="height: 800px; width: 640px;"/>
          </figure>
        </div>
        <div class="card-content">
          <div class="content">
            <h4>{{selectedItem.title}}</h4>
            <p>{{selectedItem.author}} 저</p>
            
            <small class="text-muted">ISBN - {{selectedItem.isbn}}</small>
            <br />
            <small class="text-muted">출판일자 - {{selectedItem.publishedAt}}</small>
            <br />
            <small class="text-muted">대출상태 - {{selectedItem.statusDesc}}</small>
            <br>
            <div
              v-for="tag in selectedItem.tags"
              v-bind:key="tag"
              style="display: inline; margin-right: 5px;"
            >
              <span class="badge badge-secondary">{{tag}}</span>
            </div><br>
            <h5>대출 기록</h5>
            <ul class="list-group list-group-flush">
            <div v-for="log in selectedItem.rentalLog" v-bind:key="log">
              <small class="text-muted">{{log.rentalAt}} 부터 {{log.returnAt}} 까지 {{log.userId}} 님이 대출함</small><br>
            </div>
            </ul>
            <div v-if="selectedItem.status === 1">
              <button v class="btn btn-primary" v-on:click="isRentalFormActive = !isRentalFormActive">대출</button>
              <div v-if="isRentalFormActive">
                <form>
                  <b-field label="대출 일자">
                    <b-datepicker
                      v-model="rentalAt"
                      placeholder="날짜 선택"
                      icon="calendar-today"
                      editable>
                    </b-datepicker>
                  </b-field>
                  <b-field label="반납 일자">
                    <b-datepicker
                      v-model="returnAt"
                      placeholder="날짜 선택"
                      icon="calendar-today"
                      editable>
                    </b-datepicker>
                  </b-field>

                    <button class="btn btn-primary" v-on:click="rent(selectedItem)">확인</button>
                </form>
              </div>
            </div>
            <div v-if="selectedItem.status === 0 && selectedItem.rentalLog[selectedItem.rentalLog.length - 1].userId === userId">
              <button class="btn btn-primary" v-on:click="returnReq(selectedItem)">반납 신청</button>
            </div>
          </div>
        </div>
      </div>
    </b-modal>

    <b-modal :active.sync="isLoginModalActive" has-modal-card trap-focus>
      <form action>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">로그인</p>
          </header>
          <section class="modal-card-body">
            <b-field label="사용자 이름">
              <b-input type="text" v-model="username" placeholder="사용자 이름" required></b-input>
            </b-field>

            <b-field label="비밀번호">
              <b-input
                type="password"
                v-model="password"
                password-reveal
                placeholder="비밀번호"
                required
              ></b-input>
            </b-field>
            <a class="card-link" @click="signup()">회원가입</a>
          </section>
          <footer class="modal-card-foot">
            <button class="button" type="button" @click="isLoginModalActive=false">취소</button>
            <button class="button is-primary" @click="login()" type="button">로그인</button>
          </footer>
        </div>
      </form>
    </b-modal>
  </div>
</template>

<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>

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
      tags: [],
      userId: "",
      username: "",
      password: "",
      rentalAt: new Date(),
      returnAt: new Date(),
      userId: "",
      isRentalFormActive: false,
      isLoginModalActive: false,
      isDetailModalActive: false,
      selectedItem: {}
    };
  },
  methods: {
    returnReq: function(book) {
      var request = require('request');
      var options = {
        uri: this.url + "/api/books/return",
        method: "POST",
        body: {
          bookId: book._id,
          logId: book.rentalLog[book.rentalLog.length - 1]._id,
          userId: this.userId
        },
        json: true
      }
      request.post(options, function (err, res, body) {
        if (body.error !== null && body.error !== undefined)
          return console.log(body.error);
        console.log(body.ticketId);
      });
    },
    rent: function(book) {
      if(book.status === 0 || this.userId === "") return;
      var request = require('request');
      var moment = require('moment');
      var options = {
        uri: this.url + "/api/books/rental/" + book._id,
        method: "PUT",
        body: {
          rentalAt: moment(this.rentalAt).format('YYYY-MM-DD'),
          returnAt: moment(this.returnAt).format('YYYY-MM-DD'),
          userId: this.userId
        },
        json: true
      };
      request.put(options, function (err, res, body) {
        if (body.error !== null && body.error !== undefined)
          return console.log(body.error);
      });
    },
    onItemClick: function(item) {
      this.selectedItem = item;
      this.isDetailModalActive = true;
    },
    login: function() {
      var request = require("request");
      var self = this;
      var options = {
        uri: this.url + "/api/user/login",
        method: "POST",
        body: {
          username: this.username,
          password: this.password
        },
        json: true
      };
      request.post(options, function(err, res, body) {
        if (body.error !== null && body.error !== undefined)
          return console.log(body.error);
        console.log(body);
        self.userId = body.id;
      });
    },
    signup: function() {
      var { shell } = require("electron");
      shell.openExternal(this.url + "/signup/");
    },
    deleteItem: function(id) {
      var request = require("request");
      var self = this;
      request.delete(this.url + "/api/admin/delete/" + id, function(
        err,
        res,
        body
      ) {
        self.search();
      });
    },
    tagClick: function(e) {
      console.log(e.target);
      if (this.query !== "") this.query += ",";
      this.query += e.target.innerText;
    },
    search: function() {
      this.list = [];
      this.checkServer();
      this.Query();
    },
    Query: function() {
      var request = require("request");
      var self = this;
      if (self.query === "") {
        request.get(self.url + "/api/search/" + encodeURI(self.query), function(
          err,
          res,
          body
        ) {
          if (err) return err;
          var items = JSON.parse(body);
          for (var item in items) {
            if (items[item].status === 1) {
              items[item].statusDesc = "대출되지 않음";
            } else {
              var lastLog =
                items[item].rentalLog[items[item].rentalLog.length - 1];
              items[item].statusDesc =
                lastLog.userId + " 님이 " + lastLog.returnAt + " 까지 대출중";
            }
            self.list.push(items[item]);
          }
        });
        return;
      }
      request.get(
        self.url + "/api/search/" + self.type + "/" + encodeURI(self.query),
        function(err, res, body) {
          if (err) return err;
          var items = JSON.parse(body);
          for (var item in items) {
            if (items[item].status === 1) {
              items[item].statusDesc = "대출되지 않음";
            } else {
              var lastLog =
                items[item].rentalLog[items[item].rentalLog.length - 1];
              items[item].statusDesc =
                lastLog.userId + " 님이 " + lastLog.returnAt + " 까지 대출중";
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
  },
  created() {
    var request = require("request");
    var self = this;
    request.get(self.url + "/api/tags", function(err, res, body) {
      console.log(body);
      self.tags = JSON.parse(body).list;
    });
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

.card-image {
  margin: 10px;
}

.card-link {
  color: dodgerblue;
}

.card-columns {
  column-count: 3;
}
</style>
