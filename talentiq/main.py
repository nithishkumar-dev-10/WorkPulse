import yaml
from src.config_loader import load_config

def run():
    config = load_config()

    print(f"Project  : {config['project']['name']}")
    print(f"Version  : {config['project']['version']}")
    print(f"Target   : {config['data']['test_size']} test size")

if __name__ == "__main__":
    run()
