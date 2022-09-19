from app import init_app

# change to .env before deploying
app = init_app("dev.env")

if __name__ == "__main__":
    app.run()
