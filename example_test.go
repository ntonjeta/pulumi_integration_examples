package examples

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"testing"
	"time"

	"github.com/pulumi/pulumi/pkg/v2/testing/integration"
	"github.com/stretchr/testify/assert"
)

func TestGuestbook(t *testing.T) {
	cwd, err := os.Getwd()
	if err != nil {
		t.FailNow()
	}

	test := integration.ProgramTestOptions{
		Dir:         path.Join(cwd, "cloud"),
		Quick:       true,
		SkipRefresh: true,
		ExtraRuntimeValidation: func(t *testing.T, stack integration.RuntimeValidationStackInfo) {
			var frontend = stack.Outputs["frontendIp"].(string)
			checkHTTPResult(t, frontend)
			checkMessageEndpoint(t, frontend)
		},
	}
	integration.ProgramTest(t, &test)
}

func checkHTTPResult(t *testing.T, output interface{}) bool {
	hostname := "http://" + output.(string) + ":3000"
	body := doGet(t, hostname, 5*time.Minute)
	if !assert.Contains(t, body, "<html>") {
		return false
	}
	return true
}

type dataMessage struct {
	messages []string
}

func checkMessageEndpoint(t *testing.T, output interface{}) bool {
	hostname := "http://" + output.(string) + ":3000/messages"

	message := dataMessage{
		messages: []string{"a message"},
	}

	request, err := json.Marshal(message)
	if !assert.Nil(t, err) {
		return false
	}

	body := doPost(t, hostname, bytes.NewBuffer(request), 5*time.Minute)

	body = doGet(t, hostname, 5*time.Minute)
	if !assert.JSONEq(t, "{\"messages\": []}", body) {
		return false
	}
	return true
}

func doPost(t *testing.T, hostname string, value io.Reader, maxDuration time.Duration) string {
	req, err := http.NewRequest("POST", hostname, value)
	if !assert.NoError(t, err) {
		return ""
	}

	startTime := time.Now()
	count, sleep := 0, 0

	for {
		now := time.Now()
		client := &http.Client{Timeout: time.Second * 10}
		resp, err := client.Do(req)
		if err == nil && resp.StatusCode == 200 {
			if !assert.NotNil(t, resp.Body, "resp.body was nil") {
				return ""
			}

			// Read the body
			defer resp.Body.Close()
			body, err := ioutil.ReadAll(resp.Body)
			if !assert.NoError(t, err) {
				return ""
			}

			bodyText := string(body)
			if !assert.NotNil(t, bodyText) {
				return ""
			}

			return bodyText
		}

		if now.Sub(startTime) >= maxDuration {
			fmt.Printf("Timeout after %v. Unable to http.get %v successfully.", maxDuration, hostname)
			return ""
		}
		count++
		// delay 10s, 20s, then 30s and stay at 30s
		if sleep > 30 {
			sleep = 30
		} else {
			sleep += 10
		}
		time.Sleep(time.Duration(sleep) * time.Second)
		fmt.Printf("Http Error: %v\n", err)
		fmt.Printf("  Retry: %v, elapsed wait: %v, max wait %v\n", count, now.Sub(startTime), maxDuration)
	}

	return ""
}

func doGet(t *testing.T, hostname string, maxDuration time.Duration) string {
	req, err := http.NewRequest("GET", hostname, nil)
	if !assert.NoError(t, err) {
		return ""
	}

	startTime := time.Now()
	count, sleep := 0, 0

	for {
		now := time.Now()
		client := &http.Client{Timeout: time.Second * 10}
		resp, err := client.Do(req)
		if err == nil && resp.StatusCode == 200 {
			if !assert.NotNil(t, resp.Body, "resp.body was nil") {
				return ""
			}

			// Read the body
			defer resp.Body.Close()
			body, err := ioutil.ReadAll(resp.Body)
			if !assert.NoError(t, err) {
				return ""
			}

			bodyText := string(body)
			if !assert.NotNil(t, bodyText) {
				return ""
			}

			return bodyText
		}

		if now.Sub(startTime) >= maxDuration {
			fmt.Printf("Timeout after %v. Unable to http.get %v successfully.", maxDuration, hostname)
			return ""
		}
		count++
		// delay 10s, 20s, then 30s and stay at 30s
		if sleep > 30 {
			sleep = 30
		} else {
			sleep += 10
		}
		time.Sleep(time.Duration(sleep) * time.Second)
		fmt.Printf("Http Error: %v\n", err)
		fmt.Printf("  Retry: %v, elapsed wait: %v, max wait %v\n", count, now.Sub(startTime), maxDuration)
	}

	return ""
}
