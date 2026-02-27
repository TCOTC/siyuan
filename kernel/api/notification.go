// SiYuan - Refactor your thinking
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

package api

import (
	"net/http"
	"strings"

	"github.com/88250/gulu"
	"github.com/gin-gonic/gin"
	"github.com/siyuan-note/siyuan/kernel/util"
)

func pushMsg(c *gin.Context) {
	ret := gulu.Ret.NewResult()
	defer c.JSON(http.StatusOK, ret)

	var req PushMessageRequest
	if ok := util.BindArg(c, ret, &req); !ok {
		return
	}

	msg := strings.TrimSpace(req.Msg)
	if "" == msg {
		ret.Code = -1
		ret.Msg = "msg can't be empty"
		return
	}

	timeout := 7000
	if req.Timeout != nil {
		timeout = *req.Timeout
	}
	msgId := util.PushMsg(msg, timeout)

	ret.Data = map[string]interface{}{
		"id": msgId,
	}
}

func pushErrMsg(c *gin.Context) {
	ret := gulu.Ret.NewResult()
	defer c.JSON(http.StatusOK, ret)

	var req PushErrMsgRequest
	if ok := util.BindArg(c, ret, &req); !ok {
		return
	}

	timeout := 7000
	if req.Timeout != nil {
		timeout = *req.Timeout
	}
	msgId := util.PushErrMsg(req.Msg, timeout)

	ret.Data = map[string]interface{}{
		"id": msgId,
	}
}
