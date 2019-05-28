#!/usr/bin/env bash


COUNTER=0
mkdir -p ./logs/$LOG_STREAM_NAME

aws logs get-log-events \
  --log-group-name $LOG_GROUP_NAME \
  --log-stream-name $LOG_STREAM_NAME \
  --start-from-head > "./logs/$LOG_STREAM_NAME/$COUNTER.json"

NEXT_TOKEN=$(cat "./logs/$LOG_STREAM_NAME/$COUNTER.json" | jq -r '.nextForwardToken')
END=false

while [[ $END == 'false' ]]; do

  echo $NEXT_TOKEN
  COUNTER=$(expr $COUNTER + 1)

  aws logs get-log-events \
    --log-group-name $LOG_GROUP_NAME \
    --log-stream-name $LOG_STREAM_NAME \
    --next-token $NEXT_TOKEN > "./logs/$LOG_STREAM_NAME/$COUNTER.json"

  NEXT_TOKEN=$(cat "./logs/$LOG_STREAM_NAME/$COUNTER.json" | jq -r '.nextForwardToken')
  EVENTS=$(cat "./logs/$LOG_STREAM_NAME/$COUNTER.json" | jq '.events')

  if [[ $EVENTS == "[]" || $NEXT_TOKEN == "" ]]; then
    END=true
  fi


  sleep 2

done
