import re
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from tweepy import API
from tweepy import Cursor
from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream
import sys
import json
from textblob import TextBlob

ACCESS_TOKEN = "1363233244972474369-9zzsUn8PTBkU0vbC8F5ZjE5nwGx5Up"
ACCESS_TOKEN_SECRET = "mXPs78nQGlU2fM3UpRS4ZGFJU52Wel8XjX6rQIIuzmo1Y"
CONSUMER_KEY = "gJZHJJGtTV8VYgqu4Q5tfejME"
CONSUMER_SECRET = "AcFco4qbr4eS5EhAfgMKv7NFJKMiQbAFgirw09KXndk44DQfgj"


class TwitterClient():
    def __init__(self, twitter_user=None):
        self.auth = TwitterAuthenticator().authenticate_twitter_app()
        self.twitter_client = API(self.auth)

        self.twitter_user = twitter_user

    def get_twitter_client_api(self):
        return self.twitter_client

    def get_user_timeline_tweets(self, num_tweets):
        tweets = []
        for tweet in Cursor(self.twitter_client.user_timeline, id=self.twitter_user).items(num_tweets):
            tweets.append(tweet)
        return tweets

    def get_friend_list(self, num_friends):
        friend_list = []
        for friend in Cursor(self.twitter_client.friends, id=self.twitter_user).items(num_friends):
            friend_list.append(friend)
        return friend_list

    def get_home_timeline_tweets(self, num_tweets):
        home_timeline_tweets = []
        for tweet in Cursor(self.twitter_client.home_timeline, id=self.twitter_user).items(num_tweets):
            home_timeline_tweets.append(tweet)
        return home_timeline_tweets


class TwitterAuthenticator():
    def authenticate_twitter_app(self):
        auth = OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
        auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
        return auth


class TwitterStreamer():
    def __init__(self):
        self.twitter_autenticator = TwitterAuthenticator()

    def stream_tweets(self, fetched_tweets_filename, hash_tag_list):
        listener = TwitterListener(fetched_tweets_filename)
        auth = self.twitter_autenticator.authenticate_twitter_app()
        stream = Stream(auth, listener)

        stream.filter(track=hash_tag_list)


class TwitterListener(StreamListener):

    def __init__(self, fetched_tweets_filename):
        self.fetched_tweets_filename = fetched_tweets_filename

    def on_data(self, data):
        try:
            # print(data)
            with open(self.fetched_tweets_filename, 'a') as tf:
                tf.write(data)
            return True
        except BaseException as e:
            return False
            # print("Error on_data %s" % str(e))
        return True

    def on_error(self, status):
        if status == 420:
            return False
        # print(status)


class TweetAnalyzer():

    def clean_tweet(self, tweet):
        return ' '.join(re.sub("(@[A-Za-z0-9]+)|([^0-9A-Za-z \t])|(\w+:\/\/\S+)", " ", tweet).split())

    def analyze_sentiment(self, tweet):
        analysis = TextBlob(self.clean_tweet(tweet))

        if analysis.sentiment.polarity > 0:
            return 1
        elif analysis.sentiment.polarity == 0:
            return 0
        else:
            return -1

    def tweets_to_data_frame(self, tweets):
        df = pd.DataFrame(
            data=[tweet.text for tweet in tweets], columns=['tweets'])

        df['id'] = np.array([tweet.id for tweet in tweets])
        df['len'] = np.array([len(tweet.text) for tweet in tweets])
        df['date'] = np.array([tweet.created_at for tweet in tweets])
        df['source'] = np.array([tweet.source for tweet in tweets])
        df['likes'] = np.array([tweet.favorite_count for tweet in tweets])
        df['retweets'] = np.array([tweet.retweet_count for tweet in tweets])

        return df


if __name__ == '__main__':
    twitter_client = TwitterClient()
    tweet_analyzer = TweetAnalyzer()

    api = twitter_client.get_twitter_client_api()
    nrTweets = 200

    receivedString = sys.argv[1]

    tweets = api.user_timeline(screen_name=receivedString, count=nrTweets)

    df = tweet_analyzer.tweets_to_data_frame(tweets)
    df['sentiment'] = np.array(
        [tweet_analyzer.analyze_sentiment(tweet) for tweet in df['tweets']])

    positive = df.apply(lambda x: True
                        if x['sentiment'] == 1 else False, axis=1)
    num_rows_positive = len(positive[positive == True].index)
    percentage_positive = num_rows_positive*100/nrTweets
    # print(percentage_positive)

    negative = df.apply(lambda x: True
                        if x['sentiment'] == -1 else False, axis=1)
    num_rows_negative = len(negative[negative == True].index)
    percentage_negative = num_rows_negative * 100 / nrTweets
    # print(percentage_negative)

    neutral = df.apply(lambda x: True
                       if x['sentiment'] == 0 else False, axis=1)
    num_rows_neutral = len(neutral[neutral == True].index)
    percentage_neutral = num_rows_neutral * 100 / nrTweets
    print([percentage_positive, percentage_negative, percentage_neutral])
