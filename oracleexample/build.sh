set -eu

cargo +nightly contract build --manifest-path diadata/Cargo.toml
cargo +nightly contract build