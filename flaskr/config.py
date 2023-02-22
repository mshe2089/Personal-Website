class Config(object):
    DEBUG = False
    TESTING = False
    #DATABASE_URI = something something

class ProductionConfig(Config):
    ENV="production"
    #SECRET_KEY = something something
    #DATABASE_URI = something something

class DevelopmentConfig(Config):
    ENV="development"
    DEBUG = True
    #SECRET_KEY = something something

class TestingConfig(Config):
    ENV="development"
    TESTING = True